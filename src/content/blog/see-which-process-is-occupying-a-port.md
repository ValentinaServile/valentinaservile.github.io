---
title: 'See which process is occupying a port'
description: 'Two commands to find the process holding a port, and to kill it.'
pubDate: '2021-02-14'
categories: ['Networking', 'Processes', 'Snippets']
tags: ['port', 'process', 'unix']
---

Sometimes during day-to-day development I get a `Port already in use` error (or a variant of it), and I quickly want to see which process I forgot to terminate.

We can get the PID of the process occupying a port (e.g. 8888) with:

```
$ lsof -ti:8888
```

In order to quickly kill it, we can pipe the output into the `kill` command through `xargs`:

```
$ lsof -ti:8888 | xargs kill -9
```
