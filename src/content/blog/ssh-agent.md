---
title: 'SSH Agent'
description: 'If you are using key-pair-based authentication with a passphrase for your keys, things can quickly get tedious as you have to input the passphrase every time you want to connect somewhere.'
pubDate: '2021-01-31'
updatedDate: '2021-02-02'
categories: ['Networking', 'Snippets', 'Unix']
---

If you are using key-pair-based authentication with a passphrase for your keys, things can quickly get tedious as you have to input the passphrase every time you want to connect somewhere. If you want to avoid that, you can optionally use another preinstalled tool: `ssh-agent`.

The `ssh-agent` is a little helper program that keeps track of your identity keys and their passphrases. The agent is consulted by the SSH client during the authentication process instead of the user having to specify a key – and having to type its passphrase all over again.

**Adding keys**

Simply add your private key file to the agent like this:

```shell
$ ssh-add ~/.ssh/key_name_id_rsa
```

And then connect to your server without the need to specify the passphrase:

```shell
$ ssh myuser@myserver
```

**Managing your keys**

You can see the keys which you’ve added so far with:

```shell
$ ssh-add -l
```

And remove them from the agent with:

```shell
$ ssh-add -d ~/.ssh/key_name_id_rsa
```

**_Why is the `ssh-agent` a separate program?_**

Keys that are protected with a passphrase are stored in encrypted form, so they have to be temporarily put somewhere unencrypted if they are to be reused without entering the passphrase again.  
The most secure place to store them in unencrypted form is program memory, and in Unix-like operating systems, memory is normally associated with a process.  
A normal SSH client process cannot be used to store the unencrypted key because SSH client processes only last the duration of a remote login session. Therefore, users run a program called `ssh-agent` that runs beyond the duration of a local login session, stores unencrypted keys in memory, and communicates with SSH clients using a Unix domain socket.  
SSH knows the location of the socket through the `$SSH_AUTH_SOCK` variable.

See the [man page](https://man7.org/linux/man-pages/man1/ssh-agent.1.html) and [SSH agent protocol](https://tools.ietf.org/html/draft-miller-ssh-agent-04) for more info.

### [Next: Config →](/blog/ssh-config/)

#### [← Previous: Known Hosts](/blog/ssh-known-hosts/)

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
