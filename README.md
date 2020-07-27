# Store
Lightweight JavaScript store to store state and subscribe to state changes.

## Installation
```bash
npm i @olefjaerestad/store
```

## API/examples

### Create a state store
The Store class takes two parameters: 
- The initial state: An object containing state that can be subscribed to. Must contain all properties up front (values can be undefined).
- The actions: An object containing functions that can perform CRUD operations on the state. You decide for yourself whether you want to use this or modify the state directly. Can contain both sync and async functions, but to be able to access `this` within, they must not be arrow functions.

```javascript
import { Store } from '@olefjaerestad/store';

const store = new Store(
  {
    foo: 'bar',
    lorem: 'ipsum',
    myObj: {
      baz: 'Hello',
      foo: 'bar',
    },
    myArr: [1, 2, 3],
    someAsyncVal: 'baz',
  },
  {
    setFoo: function(val) { // To have access to 'this', it must not be arrow function.
      this.state.foo = val
    },
    setSomeAsyncVal: async function(val) {
      const newValue = await somePromise(val);
      this.state.someAsyncVal = newValue;
    }
  }
);
```

### Update state
Using actions:

```javascript
store.actions.setFoo('Hello World');
```

Or directly:

```javascript
store.state.foo = 'Hello World';
```

### Access state
```javascript
const myObj = store.state.myObj;
```

### Access actions
```javascript
store.actions.setFoo('Hello World');
```

### Subscribe to state changes
Subscribe to all state changes:

```javascript
const myCallback = (prop, value, prevValue, obj, state) => console.log(prop, value, prevValue, obj, state);
store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
store.state.foo = 'I\'m a new value'; // myCallback is fired.
```

Subscribe to changes to specific state properties (could be useful for avoiding firing unnecessarily many callbacks = performance increase):

```javascript
const myCallback = (prop, value, prevValue, obj, state) => console.log(prop, value, prevValue, obj, state);
store.subscribe(['foo'], myCallback); // myCallback will fire whenever store.state.foo changes.
store.state.foo = 'I\'m a new value'; // myCallback is fired.
store.state.lorem = 'I\'m a new value'; // myCallback is not fired.
```

> Note: Subscribed callbacks will fire on changes only to direct properties of store.state, i.e. `store.state.myObj`, but not `store.state.myObj.baz`.

> Note 2: Subscribed callbacks will fire _after_ the new value is set.

### Unsubscribe from state changes
```javascript
const myCallback = (prop, value, prevValue, obj, state) => console.log('myCallback is fired');
store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
store.state.foo = 'I\'m a new value'; // 'myCallback is fired' is logged.
store.unsubscribe(myCallback);
store.state.foo = 'I\'m another new value'; // 'myCallback is fired' is no longer logged, since we unsubscribed.
```

### Changes to nested properties (objects, arrays)
Wrong:

```javascript
// Changing the value of an object property.
const myCallback = (prop, value, prevValue, obj, state) => console.log('myCallback is fired');
store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
store.state.myObj.baz = 'I\'m a new value'; // 'myCallback is fired' won't be logged. Only changes to direct properties of store.state will trigger subscribe callbacks.
```

```javascript
// Adding a value to an array.
const myCallback = (prop, value, prevValue, obj, state) => console.log('myCallback is fired');
store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
store.state.myArr.push(4); // 'myCallback is fired' won't be logged. Only changes to direct properties of store.state will trigger subscribe callbacks.
```

Correct:

```javascript
// Changing the value of an object property.
const myCallback = (prop, value, prevValue, obj, state) => console.log('myCallback is fired');
store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
store.state.myObj = {...store.state.myObj, baz: 'I\'m a new value'}; // 'myCallback is fired' is logged.
```

```javascript
// Adding a value to an array.
const myCallback = (prop, value, prevValue, obj, state) => console.log('myCallback is fired');
store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
store.state.myArr = [...store.state.myArr, 4]; // 'myCallback is fired' is logged.
```

## Typescript
The package supports typings through a .d.ts file. The following named exports are exported from the package:
- Store: class that creates a store.
- ISubscribeCallback: interface for the subscribe callbacks.

## Browser support

| Browser                  | Supported? |
| :--                      | :--        |
| Chrome >= 60             | ✅         |
| Firefox >= 55            | ✅         |
| Safari >= 11.1           | ✅         |
| Opera >= 47              | ✅         |
| Edge >= 79               | ✅         |
| Internet Explorer        | ❌         |
| Chrome for Android > 60  | ✅         |
| Firefox for Android > 55 | ✅         |
| Opera for Android > 44   | ✅         |
| Safari for iOS > 11.3    | ✅         |
| Node.js > 8.3.0          | ✅         |

Browser support is mainly affected by use of the following:
- [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

## Developing
```bash
npm i
```

&

```bash
npm run dev
```

Then just start editing the code in `/src`. If using an editor with good TypeScript support (e.g. VS Code), any errors will be inlined in the code as well.

> Note: Dev produces no output files.

## Testing
Unit testing:

```bash
npm run test
```

> Note: Unit tests will fail to run if there are errors in the tests themselves.

Integration testing:

```bash
npm run test:browsers
```

This will open a separate window where you can choose which browser to test in. Note that browsers are limited to browsers that are installed on your system _and_ [supported by Cypress](https://docs.cypress.io/guides/guides/launching-browsers.html#Browsers).

## Building
```bash
npm run build
```

> Note: Build will fail and report if there are errors.

## Publishing
Publish to npm:

```bash
npm run publish:npm
```

> Note: requires being [logged in to npm locally](https://docs.npmjs.com/cli/adduser).