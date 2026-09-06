---
title: 'Super Quick Node.js HTTP Server'
description: 'A minimal Node.js HTTP server in nine lines, for when you just need something listening on a port.'
pubDate: '2021-01-16'
updatedDate: '2021-02-02'
categories: ['JavaScript', 'Networking', 'Snippets']
---

This will start a simple server on port 3000.

Save to a file `index.js`:

```js
var http = require('http');

console.log("Server listening on port 3000");

http.createServer((req, res) => {
  console.log("Got a request");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("Hello World!");
}).listen(3000);
```

Run with:

```shell
$ node index.js
```

Output:

```
Server listening on port 3000
```
