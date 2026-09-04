---
title: 'An Isolated Developer Setup with Docker'
description: 'In this post I am going to propose a set up to run any kind of application on a developer laptop in complete isolation.'
pubDate: '2021-05-15'
updatedDate: '2022-09-30'
categories: ['AWS', 'CI/CD', 'Docker']
tags: ['aws', 'cd', 'ci', 'continuous integration', 'docker', 'ec2', 'testing']
---

In this post I am going to propose a set up to run any kind of application on a developer laptop in complete isolation. It is based on packaging the application into a Docker container, and convince it is still talking to the real world while we’re actually mocking everything around it (spoiler: using _more_ Docker containers).

![](../../assets/blog/an-isolated-developer-setup-with-docker/image.png)

  
I have used this in projects of various sizes – from small scale to really chunky applications with lots of intricate dependencies – and has generally proven itself to be worth the initial investment.

In this guide I will assume that the reader is starting from scratch, with an application that is run locally just from their IDE, with no real automation or containerisation. Feel free to skip any of the steps if they are redundant or do not apply to your situation.  
I will also assume the reader is familiar with basic concepts of Docker and networking.

## But – why?

I have been in quite a few of projects (even in really mature organisations) where any developer who wanted to look at their changes locally had to go through a set of annoying steps, or give up on running the application on their laptop completely. These steps may involve connecting to some VPN to reach other teams services, having set up authentication to the cloud provider so the application can connect to some resource it depends on, some data being set up somewhere for the local copy of the application to use, sometimes even an entire test environment is provisioned in the cloud just for this!  
  
The premise of this post is that, based on my observations in those projects, such a situation is _not_ sustainable in a modern software development team, and it negatively impacts developer productivity for the following reasons:

-   As much as we love our automated test suite and we are confident it will catch any regression, the ability to see features working end to end on a running copy of the application will always be needed for the developers’ peace of mind.  
    If doing so on their laptops becomes annoying, humans will tend to follow the path of least resistance and verify their changes on some test environment in the cloud instead. This means more potentially broken revisions in the pipeline, and a strong urge to “close the gate” to check that everything looks as it should before production. All of which is a strong contradiction to the principles of Continuous Integration and Continuous Delivery we know and love.
-   Having dependencies to real world services is asking for brittleness, even if just for manual testing. There is no guarantee those services will be up, reachable _and_ return an appropriate response.
-   As an extension of the previous point: even when third party services _do_ return an appropriate response, it is not necessarily the one needed to be able to test the feature under development (or its edge cases). The data and messages coming into the system are out of our control. Our tests will be unreliable and at best cover only a happy path.
-   Every developer’s laptop is a potential snowflake in terms of tools and libraries installed, even which operating system it’s running. This is a slippery slope to everyone having a slightly different and not easily reproducible setup. Onboarding new people into the team takes longer and unpleasant “it works on my machine” experiences happen more often. Dev/production parity is also more distant.

Given all of this, it makes sense that a good developer setup should follow the principles of good Unit Tests: it should be runnable with one command, fully in control of everything interacting with the system under test, and should be just as fine running on a developer’s laptop on a plane.

What follows are the steps I recommend to arrive to such a setup, leveraging Docker containers. At the end of this guide you should be able to bring up a whole cluster of them with one command:  

```shell
./run.sh
```

_**Note:** as we are creating a system which is completely independent and closed to the outside world, we might find that the things we mock might change without us realising it. That’s why it’s very important to have contract tests in place for all of our dependencies._

* * *

## Reproducing your deployable artifact

![](../../assets/blog/an-isolated-developer-setup-with-docker/image-1.png)

The first step is to identify how our application is currently deployed in a real production environment (as opposed to how one might like to run it in their IDE for example).  
This happens with the creation of an artifact, which is usually a bundle of our executable (or source code if we are using an interpreted language) and all of its dependencies, so that it can be moved into its desired location on the server.  
This could be a .jar or .war file, an entire directory, a binary file etc. etc.

What we want to do is to automate the creation of that artifact locally, following how it is done for production as closely as possible. Existing pipeline code, if it exists, might be a great place to look for this.  
We can automate that as the first step of our `./run.sh` script, which we will enrich until it’s able to run the whole application and its cluster of dependencies.  
  
I will use a Java application which is built into a .jar file by a Gradle task as an example:

```shell
#!/bin/bash

echo "Building artifact..."

./gradlew clean assemble 
```

This will create a file `build/libs/my-application.jar` given a `build.gradle` file containing these instructions for the archive name

```groovy
java {
    archivesBaseName = 'my-application'
}
```

* * *

## Deploying the artifact in Docker

![](../../assets/blog/an-isolated-developer-setup-with-docker/image-2.png)

Once we have the artifact created, we can define a Docker image to wrap it, so that it can be independent of our local machine configuration and run as it would on a production server.  
We will do so by creating a `Dockerfile` which will:

-   Download the base operating system image that the application should run on (or the most similar one we can find on the [DockerHub](https://hub.docker.com/))
-   Copy the artifact into the appropriate folder
-   Install any dependencies the application will need
-   Make any changes to the filesystem, network configuration etc. the application will need
-   Execute the command which runs our application as the last step

Here is how that could look like with our Java application

```dockerfile
# Starting from Java 14 base image
FROM adoptopenjdk:14-jre-hotspot

# Making sure stuff is up to date
RUN apt-get update && apt-get upgrade -y

# Installing a dependency
RUN apt-get install -y <some-library-we-need> 

# Copying the "entrypoint" script which contains the command to run our application
ADD docker-entrypoint.sh /var/opt/my-application/docker-entrypoint.sh

# Making it executable
RUN chmod +x /var/opt/my-application/docker-entrypoint.sh

# Adding our artifact too
ADD build/libs/my-application.jar /var/opt/my-application/my-application.jar

# Defining our script as our entry point
ENTRYPOINT ["/var/opt/docker-entrypoint.sh"]
```

If you are new to Docker or confused about any of the above, follow the [Dockerfile reference](https://docs.docker.com/engine/reference/builder/).

We can then create the `./docker-entrypoint.sh` file which will be used to run our application. It should contain as little code as possible, ideally just one command, as everything should have been set up by the Dockerfile.

```shell
#!/usr/bin/env bash

echo "Starting my application on port 8080"

exec java -Dserver.port=8080 \
               -DSOME_VARIABLE_I_NEED=${SOME_VALUE} \
               -XX:SomeOtherJvmOptions \
               -jar my-application.jar
```

This configuration can be tested by building the image

```shell
docker build . -t "my-application"
```

Which will perform every step present in the `Dockerfile` and create an image called “my-application”.

And then running it as a container with

```shell
docker run -p 8080:8080 my-application
```

Which will invoke the `docker-entrypoint.sh` script, making sure that port 8080 is forwarded to the host.  
If everything went well, the application should be reachable at [http://localhost:8080](http://localhost:8080), although it might still not behave correctly or struggle to start since we haven’t tweaked its configuration to work in Docker yet. We will see later how to fix that, for now we can just get it as close to working as possible.

As a last step, we want to declare how the image should be built and run into a `docker-compose.yaml` file instead of using the two commands above. This is not really necessary if we are dealing with just one service, but will be handy for us as we want to create others in the following steps (and docker-compose makes it sooo much more convenient to deal with multiple services).

```yaml
version: '3'
services:
  my-application:
    build: .
    ports:
      - "8080:8080"
```

Thanks to this file, we can just run `docker-compose build` and `docker-compose up` and the application will magically be built and run with all the parameters we have defined, instead of passing them all as command line arguments.  
We will also need to call `docker-compose down` if our script gets interrupted in order to tidy up properly.  
We can add this to our `./run.sh` script.

```shell
#!/bin/bash

echo "Building artifact..."

./gradlew clean assemble 

echo "Building image..."
docker-compose build my-application

trap 'docker-compose down' 1 3 15 #Intercepts signals which will stop our scripts, and executes the commands in quotes before exiting

echo "Starting application..."
docker-compose up

echo "Build done"
```

We can also add a command line argument that allows to skip re-building everything before running, just in case we want to see our application without any change to the source code:

```shell
#!/bin/bash

FAST=false

USAGE="
Usage: run [-f]
Options:
  -f    Fast mode. Does not rebuild service.
"

while getopts ":fhdi" opt; do
  case ${opt} in
    f ) FAST=true
      ;;
    h ) echo "$USAGE"; exit 0
      ;;
    \? ) echo "$USAGE"; exit 1
      ;;
  esac
done

if [ "$FAST" = true ]; then
    echo "Running in fast mode. Not rebuilding artifact or image"
else
    echo "Building artifact..."

    ./gradlew clean assemble 

    echo "Building image..."
    docker-compose build my-application
fi

trap 'docker-compose down' 1 3 15

echo "Starting application..."
docker-compose up
```

This allows us to invoke our script with

```shell
./run.sh -f
```

if we want to skip rebuilding the application image, and without arguments otherwise.

We have successully set up Docker around our application. Still, we haven’t changed its configuration at all and its dependencies don’t exist yet, so it will probably not work right away.  
We will be fixing that in the following sections.

* * *

## Creating a new configuration

We need to create another configuration environment for our application, to make it aware that it’s deployed within Docker, and so we can tweak all the settings we need to get it running.  
How that looks like will be highly dependent on the language and framework being used, but generally in most setups we have sets of key value pairs that are different for each environment, maybe stored in different files.  
For example, if our Java application was using with Spring, we might have some existing `application.properties` file for deploying our application to production, and we could make an `application-docker.properties` for our new Docker setup:

```ini
spring.application.name=my-application
server.port=8080
base.url=http://localhost:8080
server.ssl.enabled=false
```

Make sure that you add all parameters relevant to your setup and that the application is told to use the new profile when run inside Docker.  
For our java application, that can be done through an environment variable passed to the container in the `docker-compose.yaml`:  

```yaml
version: '3'
services:
  my-application:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ENVIRONMENT="docker"
```

And then sent to Spring via the `docker-entrypoint.sh`

```shell
#!/usr/bin/env bash

echo "Starting my application on port 8080"

exec java -Dserver.port=8080 \
               -Dspring.profiles.active="docker" \
               -DSOME_VARIABLE_I_NEED=${SOME_VALUE} \
               -XX:SomeOtherJvmOptions \
               -jar my-application.jar
```

Usually a major part of configuration is the addresses at which the application can reach its dependencies in that particular environment, which we have conveniently left out in this section.  
We will see how to configure those in the rest of the guide, as each type of external dependency will be reached in a different way.

* * *

## Mocking 3rd party services

![](../../assets/blog/an-isolated-developer-setup-with-docker/image-6.png)

Most application make use of external persistence or messaging services.  
We will look at how to mock them as another Docker container in our setup and have our application configured to talk to the mock instead of the real thing.  
In this example we will pretend our Java application needs a [Mongo Atlas](https://www.mongodb.com/cloud/atlas) cluster to run in production, which we will replace locally with a simple [MongoDB](https://www.mongodb.com/) container.

The first step is always to look for an official Docker image of the third party service we want to mock, which in most cases will be available on [Docker Hub](https://hub.docker.com/).  
We will use the [mongo](https://hub.docker.com/_/mongo) image we found, which also conveniently allows to initialise any data needed in the database by adding JavaScript files in a `/docker-entrypoint-initdb.d/` folder.  
So we need to set up a Dockerfile that starts from that base image  

```dockerfile
FROM mongo:latest

COPY init-collections.js /docker-entrypoint-initdb.d/init-collections.js
```

And some init-collections.js which could contain simple initialization code like

```js
db.createCollection("myCollection");
db.myCollection.insert([
    {
         "_id": "an-id", 
         "value": "something I need in my db for the application to start"
    }
]);
```

Since our setup is getting a bit crowded now, we can store everything related to this mock under a separate folder, obtaining this structure:

```
.
├── run.sh
├── Dockerfile
├── docker-compose.yaml
├── docker-entrypoint.sh
├── mocks
│   └── mongo
│       ├── Dockerfile
│       └── init-collections.js
└── src
```

* * *

**Note on seeding data:** official images for well known third party services will have some way to pre-populate some data or schema like MongoDB in the example, and hopefully can be used in the Docker file so that the step happens at image building time.  
However, some official images do not have such an API.  
We can bypass that restriction by adding a custom CMD in the Dockerfile: it should execute the service (in the background) plus your own script immediately after, then it can sleep to keep the container alive like this:

```dockerfile
CMD bash -c "start-service --background="true" && /location/my-data-population-script.sh && sleep infinity"
```

* * *

Once we have our Dockerfile ready and a strategy to pre-populate any data or configuration we need, we can add our new mock as a service to the `docker-compose.yaml` file, specifying that the application depends on it:

```yaml
version: '3'
services:
  mongo:
    build: mocks/mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=user
      - MONGO_INITDB_ROOT_PASSWORD=super-secure-password
      - MONGO_INITDB_DATABASE=my-application-db
  my-application:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongo # This will make sure mongo is up before our application is started
```

Finally we can change our application’s configuration for running in the Docker environment so that it talks to our mongo container instead of trying to connect the real Mongo Atlas cluster over the internet.  
We will leverage the networking features of docker-compose, which allow a container to be able to resolve the name of any service declared within the same `docker-compose.yaml` file.  
This allows our application container to be able to resolve the name “mongo” to the correct container IP address without any further configuration of the Docker network:

```ini
spring.application.name=my-application
server.port=8080
base.url=http://localhost:8080
server.ssl.enabled=false

### External dependencies
mongo.url="mongodb://user:super-secure-password@mongo:27017/admin"
```

  
We don’t need to change how we run docker-compose in our `./run.sh` script, because by default it will start all declared services in the correct order by simply doing `docker-compose up`, so we can test it immediately.  
However, we probably don’t want to rebuild the mocks images every time, as they will change much less frequently than our application image and rebuilding them would slow down the script unnecessarily.  
So we can add another flag to our `./run.sh` script to rebuild the service dependencies only if explicitly asked to do so:

```shell
#!/bin/bash

FAST=false
BUILD_DEPENDENCIES=false

USAGE="
Usage: run [-f] [-d] [-h]
Default behavior: rebuild application image, but not dependencies.

Options:
  -d    Rebuild dependencies images.
  -f    Fast mode. Does not rebuild service or dependencies. Will override -d
  -h    Displays this help
"

while getopts ":fhdi" opt; do
  case ${opt} in
    f ) FAST=true
      ;;
    d ) BUILD_DEPENDENCIES=true
      ;;
    h ) echo "$USAGE"; exit 0
      ;;
    \? ) echo "$USAGE"; exit 1
      ;;
  esac
done

if [ "$FAST" = true ]; then
    echo "Running in fast mode. Not rebuilding artifact or image"
elif [ "$BUILD_DEPENDENCIES" = true ]; then
  echo "Rebuild dependencies option specified. Will rebuild all images"

  echo "Building artifact..."

  ./gradlew clean assemble 

  docker-compose build # This builds all images
else
    echo "Building artifact..."

    ./gradlew clean assemble 

    echo "Building image..."
    docker-compose build my-application # Builds only application image
fi

trap 'docker-compose down' 1 3 15

echo "Starting application..."
docker-compose up
```

We will now be able to invoke our script with

```shell
./run.sh -d
```

If we have made any change to the mocks supporting the application, like in the seed data for example.  
We will just run it without arguments otherwise.

* * *

## Mocking other team’s custom services

![](../../assets/blog/an-isolated-developer-setup-with-docker/image-5.png)

Not all services our application depends on are open source or belong to a well known third party. Sometimes our application’s dependencies lie within the same organisation, as we need for example to collaborate with services developed custom by another team or vendor.

This means we need to create our own stub of their API, which can be done in different ways. I usually do it by making a very simple Node.js web server in an `index.js` file (it has a good balance between simplicity and ease of adding tiny bits of logic if needed).

```js
var http = require('http');

console.log("Mock 3rd party service listening on port 3000");

const stubResponse = {"key" : "value"};

http.createServer((req, res) => {
  console.log("Stub response requested");
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(stubResponse));
}).listen(3000);
```

We can include it in a very simple Dockerfile that relies on the base Node.js image:

```dockerfile
FROM node:latest

COPY index.js /opt/index.js

CMD ["node", "/opt/index.js"]
```

Which we can also add under the mocks folder next to our previously created one

```
.
├── run.sh
├── Dockerfile
├── docker-compose.yaml
├── docker-entrypoint.sh
├── mocks
│   └── other-team-service
│       ├── Dockerfile
│       └── index.js
│   └── mongo
│       ├── Dockerfile
│       └── init-collections.js
└── src
```

And finally add it as a dependency of our application in `docker-compose.yaml` file

```yaml
version: '3'
services:
  other-team-service:
    build: mocks/other-team-service
    ports:
      - "3000:3000"
  mongo:
    build: mocks/mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=user
      - MONGO_INITDB_ROOT_PASSWORD=super-secure-password
      - MONGO_INITDB_DATABASE=my-application-db
  my-application:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongo
      - other-team-service
```

And wherever needed in the configuration, using again Docker’s name resolution features

```ini
spring.application.name=my-application
server.port=8080
base.url=http://localhost:8080
server.ssl.enabled=false

### External dependencies
mongo.url="mongodb://user:super-secure-password@mongo:27017/admin"
other-team-service.url="http://other-team-service:3000"
```

* * *

## Mocking your Cloud Provider

![](../../assets/blog/an-isolated-developer-setup-with-docker/image.png)

Perhaps the most daunting task of isolating an application from everything around it is mocking cloud provider services which are invoked directly, like functions, file storage, queues, secrets manager etc.  
In this example we will focus on how to mock AWS in particular using a tool called [Localstack](https://github.com/localstack/localstack) (which natively works really well with Docker).  
Azure or Google Cloud Plaform also have their own ways of reproducing their services locally, so it is worth to check their documentation too, although they are out of the scope of this guide.  
  
Localstack will run in a Docker container and pretend to be AWS by mimicking its API, and it is very configurable: we can choose which AWS services we want to enable by passing environment variables, and we can also initialise any configuration or data we need through scripts placed in a `/docker-entrypoint-initaws.d/` folder (similarly to the MongoDB container from earlier).

Let’s start by creating a Dockerfile that will use it as a base image and set up our script in the right folder

```dockerfile
FROM localstack/localstack:latest

COPY populate-aws.sh /docker-entrypoint-initaws.d/populate-aws.sh
```

The `populate-aws.sh` scripts can contain basic instructions given through the `awslocal` command (that behaves like the official AWS cli), for example we can create some S3 buckets, SSM parameters, SQS queues…

```shell
#!/bin/bash

awslocal s3 mb s3://my-bucket
awslocal ssm put-parameter --region="eu-central-1" --name "/name/space/my-secret" --type SecureString --value "SuperSecretParameter!" --overwrite
awslocal sqs create-queue --region="eu-central-1" --queue-name "my-queue"
```

And they will be initialised as soon as localstack is up.  
Again, let’s place these two files in their own folder under mocks

```
.
├── run.sh
├── Dockerfile
├── docker-compose.yaml
├── docker-entrypoint.sh
├── mocks
│   └── localstack
│       ├── Dockerfile
│       └── populate-aws.sh
│   └── other-team-service
│       ├── Dockerfile
│       └── index.js
│   └── mongo
│       ├── Dockerfile
│       └── init-collections.js
└── src
```

  
Then we need to add the new service to docker-compose.yaml and specify which AWS features we would like it to start, plus a few more settings it needs to work (more info on the [Localstack documentation for docker-compose](https://github.com/localstack/localstack#using-docker-compose))

```yaml
version: '3'
services:
  localstack:
    build: mocks/localstack
    ports:
      - "4566-4584:4566-4584"
    environment:
      - DEFAULT_REGION=eu-central-1
      - SERVICES=ssm,s3,sqs
      - HOSTNAME_EXTERNAL=localstack
    volumes:
      - "${TMPDIR:-/tmp/localstack}:/tmp/localstack"
  other-team-service:
    build: mocks/other-team-service
    ports:
      - "3000:3000"
  mongo:
    build: mocks/mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=user
      - MONGO_INITDB_ROOT_PASSWORD=super-secure-password
      - MONGO_INITDB_DATABASE=my-application-db
  my-application:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongo
      - other-team-service
      - localstack
```

This should be enough to make Localstack run. But how do we tell our application to use that instead of connecting to the real AWS?  
Often a cloud provider is used through its SDK throughout the whole application, so we can’t just tweak a single configuration parameter to make it work, as we might have done with other kinds of mocks that are under our control.  
  
Luckily, the AWS SDK has a way to override which endpoint it will contact to talk to AWS. This feature was developed to bypass corporate proxies, but it can also be used to point to localstack.  
For example, in Java this is how we can do it for SQS:  

```java
//...
    @Bean
    public ConnectionFactory connectionFactory(@Value("${aws.local.endpoint:#{null}}") String awsEndpoint) { //AWS endpoint will only be set in docker profile
        LOG.info("Endpoint SQS: " + awsEndpoint);
        AmazonSQSClientBuilder builder = AmazonSQSClientBuilder.standard();
        if (awsEndpoint != null) {
            builder.withEndpointConfiguration(
                    new AwsClientBuilder.EndpointConfiguration(awsEndpoint, "eu-central-1") // Override with localstack endpoint if present
            );
        } else {
            builder.withRegion("eu-central-1");
        }

        builder.withCredentials(awsCredentialsProvider);

        return new SQSConnectionFactory(new ProviderConfiguration(), builder);
    }
//...
```

With the `aws.local.endpoint` property specified in the docker properties file:

```ini
spring.application.name=my-application
server.port=8080
base.url=http://localhost:8080
server.ssl.enabled=false

### External dependencies
mongo.url="mongodb://user:super-secure-password@mongo:27017/admin"
other-team-service.url="http://other-team-service:3000"

### Override AWS endpoint with localstack
aws.local.endpoint=http://localstack:4566
```

The clients for other AWS services (and for all other languages) all allow to change this configuration, so we can do the same with pretty much any other service we need.  
Please refer to the [AWS SDK documentation](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/java-dg-region-selection.html) on overriding endpoint configuration for more info.  
  
This should be the only change to application code which is necessary to run this setup.

## Code Recap

After following the steps above, the application should now be able to start without issues with `./run.sh` and have everything it needs to do its job.  
If errors persist, make sure that all necessary variables, data, and stubs have been set up correctly.  
  
In following posts we will see how to use what we have just created not just for manual testing, but for automated end to end testing of the application like a black box as well.  
  
Below is the code for the full setup:

**Structure**

```
.
├── run.sh
├── Dockerfile
├── docker-compose.yaml
├── docker-entrypoint.sh
├── mocks
│   └── localstack
│       ├── Dockerfile
│       └── populate-aws.sh
│   └── other-team-service
│       ├── Dockerfile
│       └── index.js
│   └── mongo
│       ├── Dockerfile
│       └── init-collections.js
└── src
```

**Root level**

```shell
#!/bin/bash

FAST=false
BUILD_DEPENDENCIES=false

USAGE="
Usage: run [-f] [-d] [-h]
Default behavior: rebuild application image, but not dependencies.

Options:
  -d    Rebuild dependencies images.
  -f    Fast mode. Does not rebuild service or dependencies. Will override -d
  -h    Displays this help
"

while getopts ":fhdi" opt; do
  case ${opt} in
    f ) FAST=true
      ;;
    d ) BUILD_DEPENDENCIES=true
      ;;
    h ) echo "$USAGE"; exit 0
      ;;
    \? ) echo "$USAGE"; exit 1
      ;;
  esac
done

if [ "$FAST" = true ]; then
    echo "Running in fast mode. Not rebuilding artifact or image"
elif [ "$BUILD_DEPENDENCIES" = true ]; then
  echo "Rebuild dependencies option specified. Will rebuild all images"

  echo "Building artifact..."

  ./gradlew clean assemble 

  docker-compose build # This builds all images
else
    echo "Building artifact..."

    ./gradlew clean assemble 

    echo "Building image..."
    docker-compose build my-application # Builds only application image
fi

trap 'docker-compose down' 1 3 15

echo "Starting application..."
docker-compose up
```

```yaml
version: '3'
services:
  localstack:
    build: mocks/localstack
    ports:
      - "4566-4584:4566-4584"
    environment:
      - DEFAULT_REGION=eu-central-1
      - SERVICES=ssm,s3,sqs
      - HOSTNAME_EXTERNAL=localstack
    volumes:
      - "${TMPDIR:-/tmp/localstack}:/tmp/localstack"
  other-team-service:
    build: mocks/other-team-service
    ports:
      - "3000:3000"
  mongo:
    build: mocks/mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=user
      - MONGO_INITDB_ROOT_PASSWORD=super-secure-password
      - MONGO_INITDB_DATABASE=my-application-db
  my-application:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongo
      - other-team-service
      - localstack
```

```dockerfile
# Starting from Java 14 base image
FROM adoptopenjdk:14-jre-hotspot

# Making sure stuff is up to date
RUN apt-get update && apt-get upgrade -y

# Installing a dependency
RUN apt-get install -y <some-library-we-need> 

# Copying the "entrypoint" script which contains the command to run our application
ADD docker-entrypoint.sh /var/opt/my-application/docker-entrypoint.sh

# Making it executable
RUN chmod +x /var/opt/my-application/docker-entrypoint.sh

# Adding our artifact too
ADD build/libs/my-application.jar /var/opt/my-application/my-application.jar

# Defining our script as our entry point
ENTRYPOINT ["/var/opt/docker-entrypoint.sh"]
```

```shell
#!/usr/bin/env bash

echo "Starting my application on port 8080"

exec java -Dserver.port=8080 \
               -Dspring.profiles.active="docker" \
               -DSOME_VARIABLE_I_NEED=${SOME_VALUE} \
               -XX:SomeOtherJvmOptions \
               -jar my-application.jar
```

```groovy
java {
    archivesBaseName = 'my-application'
}
```

**mocks/mongo folder**

```dockerfile
FROM mongo:latest

COPY init-collections.js /docker-entrypoint-initdb.d/init-collections.js
```

```js
db.createCollection("myCollection");
db.myCollection.insert([
    {
         "_id": "an-id", 
         "value": "something I need in my db for the application to start"
    }
]);
```

**mocks/other-team-service folder**

```dockerfile
FROM node:latest

COPY index.js /opt/index.js

CMD ["node", "/opt/index.js"]
```

```js
var http = require('http');

console.log("Mock 3rd party service listening on port 3000");

const stubResponse = {"key" : "value"};

http.createServer((req, res) => {
  console.log("Stub response requested");
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(stubResponse));
}).listen(3000);
```

**mocks/localstack folder**

```dockerfile
FROM localstack/localstack:latest

COPY populate-aws.sh /docker-entrypoint-initaws.d/populate-aws.sh
```

```shell
#!/bin/bash

awslocal s3 mb s3://my-bucket
awslocal ssm put-parameter --region="eu-central-1" --name "/name/space/my-secret" --type SecureString --value "SuperSecretParameter!" --overwrite
awslocal sqs create-queue --region="eu-central-1" --queue-name "my-queue"
```

**Inside the application:**

```ini
spring.application.name=my-application
server.port=8080
base.url=http://localhost:8080
server.ssl.enabled=false

### External dependencies
mongo.url="mongodb://user:super-secure-password@mongo:27017/admin"
other-team-service.url="http://other-team-service:3000"

### Override AWS endpoint with localstack
aws.local.endpoint=http://localstack:4566
```

```
//...
    @Bean
    public ConnectionFactory connectionFactory(@Value("${aws.local.endpoint:#{null}}") String awsEndpoint) { //AWS endpoint will only be set in docker profile
        LOG.info("Endpoint SQS: " + awsEndpoint);
        AmazonSQSClientBuilder builder = AmazonSQSClientBuilder.standard();
        if (awsEndpoint != null) {
            builder.withEndpointConfiguration(
                    new AwsClientBuilder.EndpointConfiguration(awsEndpoint, "eu-central-1") // Override with localstack endpoint if present
            );
        } else {
            builder.withRegion("eu-central-1");
        }

        builder.withCredentials(awsCredentialsProvider);

        return new SQSConnectionFactory(new ProviderConfiguration(), builder);
    }
//...
```
