/**
 * @description Lets you store state and subscribe to changes to that state.
 * 
 * @param {object} initialState - State that can be subscribed to. Doesn't have to contain all properties up front (but probably should, for readability).
 * @param {object} actions - An object containing functions that can perform CRUD operations on the state. You decide for yourself whether you want to use this or modify the state directly. Can contain both sync and async functions, but to be able to access `this` within, they must not be arrow functions.
 * 
 * @method subscribe - takes a callback function that accepts the following params: prop, value, prevValue, obj, state
 * @method unsubscribe - takes the same callback as passed to subscribe(). Used for cleanup.
 * 
 * @property {object} state - the state is available in this property, both for read and write operations.
 * @property {object} actions - the actions are available in this property, both for read and write operations.
 * 
 * @example - create a store and update the state directly:
 * const store = new Store({foo: 'bar', myObj: {baz: 'Hello'}, myArr: [1,2,3]});
 * const myCallback = (prop, value, prevValue, obj, state) => console.log(prop, value, prevValue, obj, state);
 * store.subscribe(myCallback); // myCallback will fire whenever a property of store.state changes.
 * store.state.myObj.baz = 'I'm a new value';
 * store.unsubscribe(myCallback); // cleanup
 * @example - using an action to update state:
 * const store = new Store({foo: 'bar'}, {setFoo(val) {this.state.foo = val}});
 * store.actions.setFoo('baz);
 * 
 * @author Ole Fjaerestad
 * 
 * https://stackoverflow.com/questions/42747189/how-to-watch-complex-objects-and-their-changes-in-javascript
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * https://github.com/tc39/proposal-class-fields#private-fields
 */
export class Store {
	public actions: {[key: string]: Function} = {};
	public state: {[key: string]: any};
	private subscribedCallbacks: Array<Function> = [];
	private proxyHandler = {
		get: (obj, prop, receiver) => {
			if (typeof obj[prop] === 'object' && obj[prop] !== null) {
				return new Proxy(obj[prop], this.proxyHandler);
			}
			return obj[prop];
		},
		set: (obj, prop, value, receiver) => {
			const prevValue = obj[prop];
			obj[prop] = value;
			this.subscribedCallbacks.forEach(cb => cb(prop, value, prevValue, obj, this.state));
			return true;
		}
	}

	constructor(initialState: {[key: string]: any}, actions?: {[key: string]: Function}) {
		if (!!actions) {
			for (const action of Object.keys(actions)) {
				this.actions[action] = actions[action].bind(this);
			}
		}

		this.state = new Proxy(initialState, this.proxyHandler);
	}
	// #subscribedCallbacks = []; // Not good enough browser support for private members yet.
	subscribe(callback: Function) { // Todo: Describe callback params better.
		try {
			if ( typeof callback !== 'function' ) {
				throw new Error(`Subscribe callback must be a function. Received ${typeof callback}.`);
			}
			this.subscribedCallbacks.push(callback);
		} catch(e) {
			console.warn(e);
		}
	}
	unsubscribe(callback: Function) { // Todo: Describe callback params better.
		const index = this.subscribedCallbacks.indexOf(callback);
		if (index >= 0) {
			this.subscribedCallbacks.splice(this.subscribedCallbacks.indexOf(callback), 1);
		} else {
			console.warn('Callback passed to unsubscribe() was never registered with subscribe(). Unsubscription unsuccessful.');
		}
	}
}