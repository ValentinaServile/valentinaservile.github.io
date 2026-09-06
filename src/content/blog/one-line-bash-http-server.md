---
title: 'One line Bash HTTP Server'
description: 'A one-line HTTP server for when you need something answering on a port right now, using nothing but bash and netcat.'
pubDate: '2021-01-16'
updatedDate: '2021-02-02'
categories: ['Bash', 'Networking', 'Snippets']
---

Here is a quick snippet I use all the time when I want to set up an HTTP server on the fly, without leaving the comfort of my terminal.

This is the command:

```shell
$ while true; do { echo -e 'HTTP/1.1 200 OK\r\n'; echo "Hello World"; } | nc -l 3000; done
```

_Warning: this will block your current terminal._

You will see the following output as you receive requests:

```
GET / HTTP/1.1
Host: localhost:3000
User-Agent: curl/7.54.0
Accept: */*
```

If you want your terminal back, or for any other reason want to put the command in the background while it is running, press `ctrl+z` to suspend it and then `bg` to resume it in the background:

```shell
$ bg
```

When you are done and want to kill the background process, you can do so with:

```shell
$ kill %1
```
