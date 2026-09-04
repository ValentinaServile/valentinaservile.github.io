---
title: 'SSH Authentication methods'
description: 'There are two ways of authenticating to a server with SSH: user/password based authentication (which is now by many considered outdated and insecure) and key pair based authentication.'
pubDate: '2021-01-31'
updatedDate: '2022-09-30'
categories: ['Networking', 'Snippets', 'Unix']
---

There are two ways of authenticating to a server with SSH: user/password based authentication (which is now by many considered outdated and insecure) and key pair based authentication. Let’s start from the legacy one and build up to the modern way of doing things:

#### Username and Password Based Authentication

![](../../assets/blog/ssh-authentication-methods/image.png)

In this version, all you will need to to connect to your server is to run

```shell
$ ssh myuser@server
```

And you’ll be prompted for that user’s password (nb – the user is configured on the server, not your client). Type it, press enter and voilà – you now have an open shell into the server.

##### How to set it up

You can enable this type of authentication on the server simply by making sure that the following lines are present in the file `/etc/ssh/sshd_config` for an existing user that you want to authenticate with:

```
Match User <username>
PasswordAuthentication yes
```

Then restart the ssh daemon with

```shell
$ sudo service sshd restart
```

Remember you can change the password of the user (you should set a strong one) by running

```shell
$ sudo passwd <username>
```

While this approach might be simple and familiar, it presents many security issues:

-   It is very vulnerable to brute force attacks
-   Bad (easily guessable) passwords are everywhere
-   It can be shoulder surfed or read with a keylogger
-   The password has to be sent by the ssh client to the server over the network – which means it is vulnerable to man in the middle attacks and/or an ssh demon modified by a malicious actor

Most of these are addressed by key pair based authentication, which is the way to go nowadays.

#### Key Pair Based Authentication

![](../../assets/blog/ssh-authentication-methods/image-1.png)

The idea is to assign a pair of _asymmetric keys_ to every user that needs authentication.  
Users will store their public key in every server they want to use, while their private key will remain secret and be safely stored on their computers.

That way, instead of inputting a password, your client can authenticate by specifying the private key file to the `ssh` command with the `-i` option:

```shell
$ ssh -i ~/.ssh/<your-private-key-file-name> myuser@server
```

Private keys are usually stored in the user’s `~/.ssh` folder, while public keys live in the `~/.ssh/authorized_keys` file on the server.

When a connection is attempted, the server will verify that the request was signed by one of the allowed private keys. (See below how that is accomplished).

##### How to set it up

Generate key pair with:

```shell
$ ssh-keygen -t rsa -f ~/.ssh/key_name_id_rsa
```

_You will be asked to input a passphrase for the key. This is optional and you can leave it empty, but you should definitely input a value if you want an extra security layer (the key will be stored in encrypted form and you will be asked for the passphrase every time you try to use it with an SSH client)._

This will generate 2 files:

-   `~/.ssh/key_name_id_rsa` (private key)
-   `~/.ssh/key_name_id_rsa.pub` (public key)

You can now copy the contents of the public key file into your server’s `~/.ssh/authorized_keys` file.

Next set the right permissions for your private key with:

```shell
$ chmod 600 ~/.ssh/key_name_id_rsa
```

This should allow you to ssh safely into the server with your private key.

* * *

**_Tip_:**

In addition to containing your public key file, you can also use `authorized_keys` to restrict what users can do over SSH, like which commands can be run:

```
command="/usr/local/bin/your_script.sh", ssh-rsa auiosfSAFfAFDFJL1234214DFAfDFa...
```

Or from which host a user is allowed to authenticate:

```
from="yourhost,anotherhost", ssh-rsa auiosfSAFfAFDFJL1234214DFAfDFa...
```

Etc.

* * *

##### How a key pair works

![](../../assets/blog/ssh-authentication-methods/image-2.png)

  
Pairs of public and private keys have a special asymmetric cryptographic relationship: everyone holding the public key can verify a message is signed using the corresponding private key – but without ever having access to the private key itself.

This is accomplished by applying mathematical problems called _one way functions_: operations which are easy to perform, but hard for an eavesdropper to reverse.

You can read more about public key cryptography [here](https://en.wikipedia.org/wiki/Public-key_cryptography), or watch the excellent video below for a simple explanation:

### [Next: Known Hosts →](/blog/ssh-known-hosts/)

#### [← Previous: Introduction](/blog/ssh-for-developers-beyond-the-basics-series/)

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
