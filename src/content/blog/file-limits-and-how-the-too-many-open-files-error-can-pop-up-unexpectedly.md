---
title: 'File Limits and how the “Too many open files” error can pop up unexpectedly'
description: 'I have recently come across a nasty Too many open files error, and noticed that the information on the internet about what that might mean or how to solve it doesn’t always paint a clear picture.'
pubDate: '2021-01-17'
updatedDate: '2021-02-03'
categories: ['Files', 'Snippets', 'Unix']
---

I have recently come across a nasty `Too many open files` error in a production service. It was really hard to get to the root cause, but we eventually did it. While trying to debug it, I noticed that the information on the internet about what that error might mean or how to solve it doesn’t always paint a clear picture.

Here I try to put together a more complete guide by gathering all the resources I found as I was dealing with the issue myself.

## What are file limits and file descriptors?

In Unix-like systems, each process is associated with a set of usage limits, which specify the amount of system resources it can use. One of those is the limit of open file descriptors (`RLIMIT_NOFILE`).

But what is a file descriptor?

When a file is opened by a process, a file descriptor is created. It is an abstract indicator used to access the file itself, and acts as its I/O interface. File descriptors index into a per-process **file descriptor table** maintained by the kernel.

When a process opens too many file descriptors without closing them, we stumble into the `Too many open files` (or similarly named) error.

## tl;dr: How to check current file limits

Once you get a `Too many open files` error and you know the PID (process ID) of your application, you can check its open file limits with:

```shell
$ cat /proc/<pid>/limits
```

There are two types of limits:

-   Soft: the current limit itself
-   Hard: the max value to which the soft limit may be raised (by unprivileged users)

Once you know the limits, you can get the actual number of files currently open in your process like this:

```shell
$ ls -1 /proc/<PID>/fd | wc -l
```

Finally, you can just compare the soft limit with the number of open file descriptors to confirm that your process is close to reaching the limit.

Once you have determined whether you have a bug in your application (see below for why that might not be so obvious), or the limit is simply too low, you might decide you want to increase it.

## Increasing process file limits

Open file limits for processes are normally set by:

-   the **kernel** at boot time (the very first limit is set for the `init` process). To see these limits: `cat /proc/1/limits`
-   **inherited** from the parent process (when a process is forked with the system call `fork(2)`). This implies that the limits given to `init` are then inherited by all other child processes.

Once a process is running, limits can be overridden in a number of ways, depending on your context.

#### Just for the current process and all its children

You can use the `ulimit` utility to override kernel/inherited values:

```shell
$ ulimit -n <new limit>
```

You can optionally add the `-H` and `-S` options to specify whether you want to increase the hard or soft limit. If neither option is provided, ulimit sets both the hard and soft limits for the resource specified. _(Keep in mind that unprivileged users cannot raise hard limits.)_

Since `ulimit` is a bash built-in command, in practice it only affects the current shell and the processes spawned by it.

_More info on the [man page](https://man7.org/linux/man-pages/man3/ulimit.3.html)_

#### For another running process

You can use the new_(ish)_ utility `prlimit` in order to override limits for another process by PID. It has been available since Linux 2.6.36.

```shell
$ prlimit --pid 1 --nofile=1337:1337
```

Where the first number is the soft limit, and the second number is the hard limit.

You can also give it a command instead of a PID, and it will run that command with the given resources:

```shell
$ prlimit --nofile=1337:1337 echo hello
```

_More info on the [man page](http://manpages.ubuntu.com/manpages/xenial/man1/prlimit.1.html)_

#### For all processes of a certain user

You can replace the kernel/inherited values every time a user session is opened by using a Pluggable Authentication Modules (PAM) module called **pam\_limits**.

Most major Linux distributions already ship with this module as part of their standard PAM configuration, and its role is to set parameters on system resources on a per-user (or per-group) basis.

You can configure it by editing the `/etc/security/limits.conf` file, for example by adding the following line: 

```
myuser       hard    nofile  20000
myuser       soft    nofile  15000
```

_Tip: you can also use the wildcard \* instead of the user name if you want the change to be applied to all users_

After this, you need to edit the file `/etc/pam.d/login`, making sure this line is present and uncommented:

```
session    required   pam_limits.so
```

The changes will be permanent and survive across reboots. Note however that they can still be overridden for a single process by `ulimit`.

#### From within your application (system calls)

If you need to fiddle with process limits from within your application itself, Linux exposes three system calls to do that (which are ultimately what’s used under the hood by `ulimit` or any other utility).

-   `prlimit`, which allows setting and getting resource limits corresponding to an arbitrary process.
-   `setrlimit` and `getrlimit`: respectively, set and get resource limits corresponding to the currently running process (and its future children).

_More info on the [man page](https://linux.die.net/man/2/prlimit)_

You should consult the documentation of your programming language of choice to see if it offers a wrapper for them.

#### If you’re using Docker

The `ulimit` settings of all Docker containers are inherited from the Docker daemon by default, as the container itself is just another process.

From inside a Docker container, you cannot override file limits with `ulimit`. This is because letting programs running in a container change the ulimit settings of the host is regarded as a security risk.

_(This does not apply to containers running in privileged mode.)_

However, you can start the container with its own custom limits in two ways:

##### As an argument to the `docker run` command

You can use the `--ulimit` flag (first number being the soft limit, and the second being the hard limit).

```shell
$ docker run --ulimit nofile=1337:1337 <image-tag>
```

##### In docker-compose

The same option is available in `docker-compose`:

```yaml
version: '3'
services:
  myservice:
    ulimits:
      nofile:
        soft: 1337
        hard: 1337
```

## Increasing system-wide file limits

In Linux systems there is also `file-max`: the absolute maximum number of open file descriptors from all processes combined, enforced at kernel level.

You might want to increase this limit too if you are dealing with several processes with high limit requirements, or if you just want to raise the ceiling of the limits you can set for a single process.

You can check its current value with:

```shell
$ cat /proc/sys/fs/file-max
```

(_Note that this is just a number and there is no concept of hard or soft limit, as this is a setting for the kernel and we are not in a “per process” context_)

And change its default value in the file `/etc/sysctl.conf` by making sure this line exists:

```
fs.file-max=250000
```

If you want to apply the change right away, you can do so with:

```shell
$ sysctl -p
```

## Why are file limits a thing?

The main reasons why Linux limits the number of open files are:

-   The operating system needs memory to manage each open file descriptor, and memory is a limited resource. If you were to set limits that are too high and the system ran out of memory, any remaining open files could be corrupted.
-   Security: if a user process were able to keep opening files, it could do so until the server went down.

The default limits on most Linux distributions might be conservative, but you should still be careful when increasing them.

## Debugging why your application might be reaching its file limits

Before you go increasing file limits left and right, you should consider whether your application might have a file descriptor leak, e.g. opening files without closing them. If it does, increasing file limits might not only fail to solve the problem — it might actually make it worse.

Take for example this code which opens file descriptors in a loop without ever closing them:

```c
 
int main(int argc, char **argv) {
    char filename[100];
    for (size_t i = 0; i < INT_MAX; ++i) {
        sprintf(filename, "/tmp/%010ld.txt", i);
        FILE *fp = fopen(filename, "w");
    }
    return 0;
}
```

If this is left running and there is no ceiling on the file limits, ultimately the memory of the system will fill with garbage file descriptors.

The correct behaviour would be to always invoke `fclose` (or your language’s equivalent) once you have opened a file handle, so you should always check your code for this type of mistake first.

An application which opens regular files without ever closing them is an obvious example, but it is far from the only one. In reality, you might be surprised at what kinds of things an application can do that rely on opening file descriptors.  

#### Everything is a file

“Everything is a file” describes one of the defining features of Unix-like systems – that a wide range of input/output resources are represented as simple streams of bytes exposed through the filesystem API.

Unix files are able to represent:

-   Regular files
-   Directories
-   Symbolic links
-   Devices
-   Pipes and named pipes
-   Sockets

> “Everything is a file”. However that term does the idea an injustice as it overstates the reality. Clearly everything is not a file. Some things are devices and some things are pipes and while they may share some characteristics with files, they certainly are not files. A more accurate, though less catchy, characterization would be “everything can have a file descriptor”. It is the file descriptor as a unifying concept that is key to this design. It is the file descriptor that makes files, devices, and inter-process I/O compatible.
> 
> – Neil Brown, [Ghosts of Unix Past: a historical search for design patterns](https://lwn.net/Articles/411845/)

It is apparent that file descriptors are a central part of the functioning of Unix-like operating systems, way beyond the day-to-day of writing and reading regular files. Therefore, we should consider every interaction with the underlying operating system as a potential source of file descriptor leaks.

In particular, you might want to check all integration points between your application and:

-   I/O devices
-   the network (especially long-running requests!)
-   other processes
-   the filesystem

You can easily monitor the number of open file descriptors by periodically invoking a command such as `lsof`, or as we saw above:

```shell
$ ls -1 /proc/<PID>/fd | wc -l
```

Or by attaching a profiler to your application.

If the number of file descriptors keeps increasing rather than staying stable, this might suggest the application has a file descriptor leak.

### Resources and further reading:

-   [https://ops.tips/blog/proc-pid-limits-under-the-hood/](https://ops.tips/blog/proc-pid-limits-under-the-hood/)
-   [https://subvisual.com/blog/posts/2020-06-06-fixing-too-many-open-files](https://subvisual.com/blog/posts/2020-06-06-fixing-too-many-open-files)
-   [https://linoxide.com/linux-how-to/03-methods-change-number-open-file-limit-linux/](https://linoxide.com/linux-how-to/03-methods-change-number-open-file-limit-linux/)
-   [https://serverfault.com/questions/122679/how-do-ulimit-n-and-proc-sys-fs-file-max-differ](https://serverfault.com/questions/122679/how-do-ulimit-n-and-proc-sys-fs-file-max-differ)
