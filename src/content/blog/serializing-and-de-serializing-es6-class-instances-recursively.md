---
title: 'Serializing and de-serializing ES6 class instances recursively'
description: 'We have all been warned not to use ES6 classes. Perhaps by our colleagues, or perhaps by the endless number of scary blog posts that show up if you dare Google the subject.'
pubDate: '2022-09-30'
categories: ['JavaScript', 'Snippets']
tags: ['es6', 'javascript', 'types']
---

We have all been warned not to use ES6 classes. Perhaps by our colleagues, or perhaps by the endless amount of scary blog posts that show up if you dare Google the subject. However, if you thought you had a use case for them you might have used them anyway (or perhaps you are in too deep and cannot rewrite your entire codebase). And now you have stumbled upon this serialization problem and need to quickly find a solution that isn’t “just use TypeScript instead”.

The gist of it is: JavaScript is not a typed language, even if it sometimes pretends to be. When we make use of type-y features like classes and interfaces, some behaviors might occur that can be a bit puzzling if you are coming from, say, Java or Kotlin. One such behavior is how class instances get converted to and from JSON.

Or rather, how they **don’t**.

## The problem with JavaScript classes and serialization

Imagine we have a class in our code:

```js
class MyClass {
   myField;

   doThing() {
      console.log("I am doing the thing");
   }

}

export default MyClass;
```

Now let’s try to serialize it:

Code:

```js
import MyClass from "./MyClass.js"

const instance = new MyClass();
instance.myField = "123"

const json = JSON.stringify(instance)
console.log(json)
```

Output:

```json
{
  "myField" : "123"
}
```

However, when we try to read our class instance back from JSON…

Code:

```js
const instance = JSON.parse(json)

instance.doThing()
```

Output:

```
Uncaught TypeError: instance.doThing is not a function
```

We get this error because the JSON was deserialized into a plain JavaScript object, as JavaScript doesn’t know any better and cannot distinguish between a simple object and what should be an instance of a class.

In a properly typed language like Java, we would be able to tell the JSON reader which class we want to use as a base:

```java
ObjectMapper mapper = new ObjectMapper();
String json = "{...}";

//JSON from String to Object
MyClass instance = mapper.readValue(json, MyClass.class);
```

But JavaScript is _not_ a properly typed language, even if it does have classes, and this is not supported.

## The solution (simple)

Not all is lost. In order to “cast” our plain JavaScript object to an instance of our class, we can use `Object.assign` like this:

Code:

```js
const deserialized = JSON.parse(json);

const instance = Object.assign(new MyClass(), deserialized);

instance.doThing();
```

Output:

```
I am doing the thing
```

This code creates a new empty instance of our class, then assigns to its fields all of the values found in the `deserialized` object.

## Another problem: nested classes

The previous solution will work just fine for one class with simple fields, but if we have several classes collaborating with each other, then it will not be enough.

Consider the following scenario where our `MyClass` can contain an instance of another class `MyOtherClass`:

`MyClass`

```js
class MyClass {
   myField;
   myClassField;

   doThing() {
      console.log("I am doing the thing");
   }

}

export default MyClass;
```

`MyOtherClass`

```js
class MyOtherClass {
   myOtherField;

   doOtherThing() {
      console.log("I am doing the other thing");
   }

}

export default MyOtherClass;
```

Let’s try to serialize and deserialize using the previous solution and see what happens to the instance of `MyOtherClass`:

Code:

```js
import MyClass from "./MyClass.js"
import MyOtherClass from "./MyOtherClass.js"

const originalInstance = new MyClass();
originalInstance.myField = "123"
originalInstance.myClassField = new MyOtherClass();

const json = JSON.stringify(originalInstance)

const deserialized = JSON.parse(json);

const newInstance = Object.assign(new MyClass(), deserialized);

newInstance.myClassField.doOtherThing();
```

Output:

```
Uncaught TypeError: newInstance.myClassField.doOtherThing is not a function
```

This has happened because `Object.assign` will only convert the very top layer of this hierarchy into a class instance, and will treat any children and grandchildren as plain old objects: there’s no way for it to know that they too should respect a particular type.

## The solution (recursive)

When we have an arbitrary tree of nested classes we need to somehow recursively and dynamically deserialize all types. Fortunately, `JSON.parse` and `JSON.stringify` offer very convenient callbacks so that we can customise the serialization of each node in the structure. They will be called multiple times in case of a structure with nested nodes.

The trick is to use them to add a `__type` field in our JSON output in order to keep track of what class should be used during deserialization.

In order to do that we need to make custom serialize and deserialize functions:

```js
function serialize(classInstance) {
    return JSON.stringify(classInstance, (key, value) => {
      if (value && typeof(value) === "object") {
        value.__type = value.constructor.name;
      }
      return value;
    });
  }
```

The serialize function will add a `__type` property to each JSON node indicating which class it is an instance of.

```js
import MyClass from "./MyClass.js";
import MyOtherClass from "./MyOtherClass.js";
import YetAnotherClass from "./YetAnotherClass.js";

function deserialize (jsonString) {
    const classes = {
      Object,
      MyClass,
      MyOtherClass,
      YetAnotherClass,
    };

    return JSON.parse(jsonString, (key, value) => {
      if (value && typeof (value) === "object" && value.__type) {
        const DynamicClass = classes[value.__type]
        value = Object.assign(new DynamicClass(), value);
        delete value.__type;
      }
      return value;
    });

  }
```

The deserialize function will read the `__type` property for each node, dynamically create an instance of that type and perform the `Object.assign` operation on it.

Note that the `__type` field gets removed so that the calling code can remain unaware of the implementation details of our serialization.

### Limitations

This approach works, but it has some important limitations:

-   Our JSON output will be “polluted” with the extra field
-   All constructors in our classes need to be able to accept no parameters, as they will be called without arguments during deserialization
-   Perhaps most importantly, we need to keep track of all of the classes that we are using in a list for deserialization. This makes our code more fragile: if we introduce a new class and forget to update the list then the implementation will break.
-   `serialize` mutates the instance it is given: the `__type` property it adds stays on the original object after the call. `deserialize` strips it from the object it returns, so a round trip comes back clean, but anything still holding the original instance will see the extra field.

## Conclusion

Yes, unfortunately after quite a lot of research this (rather complicated) solution is the best one I found. It is not ideal, but at least it encapsulates the problem and allows us to work with classes and JSON.

Let me know in the comments if you found anything better.
