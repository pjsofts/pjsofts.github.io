---
title: "Values and Data Types"
description: "Javascript Basic Datatypes"
---
In JavaScript, variables are used to store data values. Each variable has a name, which is used to reference the stored value, and a data type, which defines the type of data that the variable can hold. JavaScript supports several data types, each with its own characteristics and uses. 

Let's go through some common data types with code examples:


1. **Numbers**: Used for storing numeric values.

```javascript
var age = 25; // Integer
var price = 99.99; // Floating-point number
```

2. **Strings**: Used for storing text.

```javascript
var name = "John"; // Double or single quotes can be used
var message = 'Hello, world!';
```

3. **Booleans**: Used for storing true or false values.

```javascript
var isLogged = true;
var hasPermission = false;
```

4. **Null**: Represents the intentional absence of any value.

```javascript
var myVar = null;
```

5. **Undefined**: Represents an uninitialized variable or a missing value.

```javascript
var myVar;
console.log(myVar); // Outputs: undefined
```

6. **Objects**: Used for storing collections of key-value pairs.

```javascript
var person = {
    firstName: "Alice",
    lastName: "Johnson",
    age: 30
};
```

7. **Arrays**: Used for storing ordered collections of values.

```javascript
var colors = ["red", "green", "blue"];
```

8. **Functions**: Used for storing reusable blocks of code.

```javascript
function add(a, b) {
    return a + b;
}
```

9. **Symbols** (ES6): Used to create unique identifiers.

```javascript
var id = Symbol("uniqueID");
```

10. **BigInt** (ES11): Used for working with large integers.

```javascript
var bigValue = 1234567890123456789012345678901234567890n;
```

Now, let's see some variable examples:

```javascript
// Variable declaration and assignment
var age = 30;
var name = "Alice";
var isLoggedIn = true;

// Variable reassignment
age = 31;
name = "Bob";
isLoggedIn = false;

// Using variables in expressions
var total = age + 10;
var greeting = "Hello, " + name + "!";
```

