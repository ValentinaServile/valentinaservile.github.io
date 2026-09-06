---
title: 'The same code with Callbacks vs Promises vs Async/Await'
description: 'Sometimes in JavaScript you have to deal with different flavours of asynchronous code, so it is handy to be able to map back and forth between them.'
pubDate: '2021-02-13'
updatedDate: '2022-09-30'
categories: ['JavaScript', 'Snippets']
---

Sometimes in JavaScript you have to deal with different flavours of asynchronous code, so it is handy to be able to map back and forth between them.

### Callback

Functions that do something asynchronously are typically implemented using the callback pattern, and their implementation might look like this:

```js
const myAsyncFunction = (parameter, callback) => {
    const result = //do something async here...
    callback(result, error);
};
```

They may be invoked in the following way:

```js
const main = () => {
    myAsyncFunction("parameter", (result, error) => {
       //use the result or error here
    });
};
```

However, things may quickly get out of hand if we need the result of an asynchronous function to invoke another asynchronous function, and then we need that to invoke another one, and so on:

```js
const main = () => {
    myAsyncFunction("parameter", (result, error) => {
       myOtherAsynchronousFunction(result, (otherResult, otherError) => {
           myFinalAsynchronousFunction(otherResult, (finalResult, finalError) => {
              //whew!
           });
       });
    });
};
```

### Promise

We can use Promises to solve the indentation mess above. For example, this is how we might change our `main` function if we want to wrap `myAsyncFunction` in a promise:

```js
const main = () => {

    const myPromise = new Promise((resolve, reject) => {
        myAsyncFunction("parameter", (result, error) => {
            if (!error) { //or other equivalent check
                resolve(result);
            } else {
                reject(error);
            }
        });
    });

    myPromise
    .then((result) => { /* handle result here */ })
    .catch((error) => { /* handle error here */ })
};
```

Promises can be chained, so now we don’t have to nest in order to use the result of an asynchronous operation:

```js
const main = () => {

   //...

    myPromise
    .then(myOtherPromise)
    .then(myFinalPromise)
    .catch((error) => { /* handle error here */ })
};
```

More on Promises and chaining in the [official docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### Async/Await

Once we are already dealing with promises, it is possible to ditch the `.then()` and `.catch()` functions from the Promise API and use the async/await syntactic sugar:

```js
const main = async () => {

    const myPromise = new Promise((resolve, reject) => {
        myAsyncFunction("parameter", (result, error) => {
            if (!error) { //or other equivalent check
                resolve(result);
            } else {
                reject(error);
            }
        });
    });

   const result = await myPromise;
};
```

_(Remember to change the `main` function to be async!)_

This way the code can look much more similar to synchronous code:

```js
const main = async () => {

   //...
   const result = await myPromise;
   const otherResult = await myOtherPromise;
   
   return result + otherResult;
};
```
