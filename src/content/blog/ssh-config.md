---
title: 'SSH Config'
description: 'As well as having to type passphrases, remembering the right user, key file, port and other settings for each host you want to SSH into might quickly become overwhelming.'
pubDate: '2021-01-31'
updatedDate: '2021-02-02'
categories: ['Networking', 'Operating Systems', 'Unix']
---

As well as having to type passphrases, remembering the right user, key file, port and other settings for each host you want to SSH into might quickly become overwhelming.

That’s why, in addition to the command line options we saw so far, SSH also allows to read the same options from configuration files.

The configuration data will be applied from the following sources in the following order:

1.  command-line options
2.  user’s configuration file (located in `~/.ssh/config`)
3.  system-wide configuration file (located in `/etc/ssh/ssh_config`)

**How to write `~/.ssh/config` and `/etc/ssh/ssh_config` files**

The configuration files are split into sections, each representing a Host specification. Each section allows us to define a server we’ll frequently want to connect to and give it a pet name, so that we can specify some default parameters for it.

Let’s take for example this command to SSH into `server.123.mydomain.com`, with lots of hard to remember bits:

```shell
$ ssh -i ~/ssh/my_key_with_a_long_name_id_rsa -p 1337 myusername@server.123.mydomain.com
```

Instead of typing all of that out each time we want to connect, we can put a Host specification in `~/.ssh/config` like this:

```
Host myserver
     HostName server.123.mydomain.com
     User myusername
     Port 1337
     IdentityFile ~/ssh/my_key_with_a_long_name_id_rsa
```

And then connect in the future simply with

```shell
$ ssh myserver
```

* * *

**_Tip:_**

You can also use wildcards in the value for `Host`, meaning you can use

```
Host *
   Key Value
   ...
```

to specify parameters for all hosts, or even for example

```
Host i-*
   Key Value
   ...
```

to specify parameters for all hosts which have the name of Amazon EC2 instances.

* * *

This is just a basic example, but an important thing to note is that you can specify just about any parameter in SSH configuration files. In fact, there are even a few advanced configuration parameters which are unavailable as command line arguments.  
In order to still allow to use them on the command line, SSH offers the special flag:

```shell
$ ssh -oParameterKey="ParameterValue" myuser@myserver
```

So it is definitely worth taking a look at the complete list in case they are ever needed.

See the [man page](https://man7.org/linux/man-pages/man5/ssh_config.5.html) for more info.

### [Next: Jumping Hosts →](/blog/jumping-ssh-hosts/)

#### [← Previous: SSH Agent](/blog/ssh-agent/)

### Table of Contents:

1.  [Introduction](/blog/ssh-for-developers-beyond-the-basics-series/)
2.  [Authentication](/blog/ssh-authentication-methods/)
3.  [Known Hosts](/blog/ssh-known-hosts/)
4.  [SSH Agent](/blog/ssh-agent/)
5.  [Config](/blog/ssh-config/)
6.  [Jumping Hosts](/blog/jumping-ssh-hosts/)
7.  [Tunnelling and Port Forwarding](/blog/ssh-tunnelling-and-port-forwarding/)
8.  [X11 Forwarding](/blog/ssh-x11-forwarding/)
9.  [Multiplexing and Master Mode](/blog/ssh-multiplexing-and-master-mode/)
