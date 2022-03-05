/**
 * @description Lets you store state and subscribe to changes to that state.
 * 
 * @param {object} initialState - State that can be subscribed to. Must contain all properties up front (values can be undefined).
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
 * store.state.foo = 'I'm a new value';
 * store.unsubscribe(myCallback); // cleanup
 * @example - using an action to update state:
 * const store = new Store({foo: 'bar'}, {setFoo: function(val) {this.state.foo = val}});
 * store.actions.setFoo('baz);
 * 
 * @author Ole Fjaerestad
 * 
 * https://stackoverflow.com/questions/42747189/how-to-watch-complex-objects-and-their-changes-in-javascript
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * https://github.com/tc39/proposal-class-fields#private-fields
 */

export interface ISubscribeCallback<S extends Record<string | number | symbol, any> = {}> {
	(
		prop: keyof S,
		value?: S[keyof S],
		prevValue?: S[keyof S],
		obj?: S,
		state?: Store<S>['state']
	): any;
}

interface ISubscribeCallbackObj<S extends Record<string | number | symbol, any> = {}> {
	callback: ISubscribeCallback<S>;
	props: Array<string | number | symbol>;
}

export class Store<S extends Record<string | number | symbol, any>> {
	/** Object containing user-defined functions for interacting with the state. Passed as parameter to `new Store()`. */
	public actions: Record<string, (this: Store<S>['actions'], ...rest: any[]) => any> = {};
	/** Object containing the state. Initial value is passed as parameter to `new Store()`. */
	public state: S;
	/** Private. Array of subscribed callbacks. */
	private subscribedCallbacks: ISubscribeCallbackObj<S>[] = [];
	// #subscribedCallbacks: Array<ISubscribeCallbackObj> = []; // Not good enough browser support for private members yet.
	/** Private. Proxy logic responsible for state getters/setters. */
	private proxyHandler: {set: any} = {
		/** Return proxy for objects. Lets us react to changes to nested properties of this.state. 
		 * Disabled for performance reasons. */
		/* get: (obj: {[key: string]: any}, prop: string|number, proxy: any): any => {
			if (typeof obj[prop] === 'object' && obj[prop] !== null) {
				return new Proxy(obj[prop], this.proxyHandler);
			}
			return obj[prop];
		}, */
		set: (obj: S, prop: keyof S, value: S[keyof S], proxy: any) => {
			const prevValue = obj[prop];
			// const isDirectChange = !!obj._storeMeta && !!obj._storeMeta.isStore;
			obj[prop] = value;
			this.subscribedCallbacks
				// .filter(cb => cb.props.length === 0 || (isDirectChange && cb.props.includes(prop)))
				.filter(cb => cb.props.length === 0 || cb.props.includes(prop))
				.forEach(cb => cb.callback(prop, value, prevValue, obj, this.state));
			return true;
		},
	}

	/** Create a new state store. `Store.state.prop = val` to update state. */
	constructor(initialState: S, actions?: Record<string, (this: Store<S>, ...rest: any[]) => any>) {
		if (!!actions) {
			for (const action of Object.keys(actions)) {
				this.actions[action] = actions[action].bind(this);
			}
		}

		// this.state = new Proxy({...initialState, _storeMeta: {isStore: true}}, this.proxyHandler);
		this.state = new Proxy<S>(initialState, this.proxyHandler);
	}
	/** Run callback when state changes. To subscribe to all prop changes, pass empty array to properties or callback as first param. */
	subscribe(properties: Array<keyof S> | ISubscribeCallback<S>, callback?: ISubscribeCallback<S>): boolean {
		const cb = arguments[arguments.length-1];
		const props = Array.isArray(properties) ? properties : [];

		try {
			if ( typeof cb !== 'function' ) {
				throw new Error(`Subscribe callback must be a function. Received ${typeof cb}.`);
			}
			this.subscribedCallbacks.push({
				callback: cb,
				props,
			});
			return true;
		} catch(e) {
			console.warn(e);
			return false;
		}
	}
	/** Stop running callback when state changes. Callback must be registered with `subscribe` first. */
	unsubscribe(callback: ISubscribeCallback<S>): boolean {
		const index = this.subscribedCallbacks.findIndex(cb => cb.callback === callback);
		if (index >= 0) {
			this.subscribedCallbacks.splice(index, 1);
			return true;
		} else {
			console.warn('Callback passed to unsubscribe() was never registered with subscribe(). Unsubscription unsuccessful.');
			return false;
		}
	}
}
