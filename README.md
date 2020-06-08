# Store
Lightweight Javascript store to store state and subscribe to state changes.

## Installation
```bash
npm i @olefjaerestad/store
```

## API/examples

### Create a state store.
The Store class takes two parameters: 
- The initial state: An object containing state that can be subscribed to. Doesn't have to contain all properties up front (but probably should, for readability).
- The actions: An object containing functions that can perform CRUD operations on the state. You decide for yourself whether you want to use this or modify the state directly. Can contain both sync and async functions, but to be able to access `this` within, they must not be arrow functions.

```javascript
import { Store } from '@olefjaerestad/store';

const store = new Store(
	{
		foo: 'bar',
		myObj: {
			baz: 'Hello'
		},
		someAsyncVal: 'baz',
	},
	{
		setFoo: function(val) { // To have access to 'this', it must not be arrow function.
			this.foo = val
		},
		setSomeAsyncVal: async function(val) {
			const newValue = await somePromise(val);
			this.someAsyncVal = newValue;
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

### Accesing state
```javascript
const myObj = store.state.myObj;
```

### Accessing actions
```javascript
store.actions.setFoo('Hello World');
```

### Subscribe to state changes
```javascript
const myCallback = (prop, value, prevValue, obj, state) => console.log(prop, value, prevValue, obj, state);
store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
store.state.myObj.baz = 'I\'m a new value'; // myCallback is fired.
```

> Note: Subscribed callbacks will fire _after_ the new value is set.

> Note 2: Subscribed callbacks will fire on changes to both direct and nested properties of store.state, i.e. `store.state.myObj` and `store.state.myObj.baz`.

### Unsubscribe from state changes
```javascript
const myCallback = (prop, value, prevValue, obj, state) => console.log('myCallback is fired');
store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
store.state.myObj.baz = 'I\'m a new value'; // 'myCallback is fired' is logged.
store.unsubscribe(myCallback);
store.state.myObj.baz = 'I\'m another new value'; // 'myCallback is fired' is no longer logged, since we unsubscribed.
```

## Browser support

| Browser                  | Supported? |
| :--                      | :--        |
| Chrome >= 49             | ✅         |
| Firefox >= 18            | ✅         |
| Safari >= 10             | ✅         |
| Opera >= 36              | ✅         |
| Edge >= 12               | ✅         |
| Explorer                 | ❌         |
| Chrome for Android > 49  | ✅         |
| Firefox for Android > 18 | ✅         |
| Opera for Android > 36   | ✅         |
| Safari for iOS > 10      | ✅         |
| Node.js > 6.0.0          | ✅         |


> Note: For increased browser support, you can use the [Proxy polyfill](https://github.com/GoogleChrome/proxy-polyfill)

## Developing
```bash
npm run dev
```

Then just start editing the code in `/src`. If using an editor with good TypeScript support (e.g. VS Code), any errors will be inlined in the code as well.

> Note: Dev produces no output files.

> Note2: No testing in browser (yet), so it's recommended running tests alongside developing.

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