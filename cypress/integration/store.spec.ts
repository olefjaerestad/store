/// <reference types="cypress" />

import { Store } from '../../src/store';

const store = new Store(
	{
		name: 'My name',
		obj: {
			foo: 'bar',
			lorem: 'ipsum',
			name: 'Another name',
		},
	},
	{
		setName: function(name: string) {
			this.state.name = name;
		},
	}
);

describe('Store', () => {
	it('Should update state when using actions.', () => {
		const newName = 'My new name';
		store.actions.setName(newName);
		expect(store.state.name).to.equal(newName);
	});
	it('Should be subscribeable.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => prop === 'name' ? isSubscribed = true : null;
		store.subscribe(subscriber);
		store.state.name = 'My new name';
		expect(isSubscribed).to.be.true;
	});
	it('Should be unsubscribeable.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => prop === 'name' ? isSubscribed = true : null;
		store.subscribe(subscriber);
		store.unsubscribe(subscriber);
		store.state.name = 'My new name';
		expect(isSubscribed).to.be.false;
	});
	it('Specific props should be subscribeable.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => isSubscribed = !isSubscribed;
		store.subscribe(['name'], subscriber);
		store.state.name = 'My new name';
		store.state.obj.foo = 'My very new name';
		expect(isSubscribed).to.be.true;
	});
	it('subscribe() should handle 1 parameter: callback only.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => prop === 'name' ? isSubscribed = true : null;
		store.subscribe(subscriber);
		store.state.name = 'My new name';
		expect(isSubscribed).to.be.true;
	});
	it('subscribe() should handle 2 parameters: properties and callback.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => prop === 'name' ? isSubscribed = true : null;
		store.subscribe(['obj'], subscriber);
		store.state.name = 'My new name';
		expect(isSubscribed).to.be.false;
	});
	it('Subscribed callbacks registered without specific properties should run on nested property changes.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => prop === 'foo' ? isSubscribed = true : null;
		store.subscribe(subscriber);
		store.state.obj.foo = 'baz';
		expect(isSubscribed).to.be.true;
	});
	it('Subscribed callbacks registered with specific properties should run on changes to direct properties of state.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => prop === 'name' ? isSubscribed = true : null;
		store.subscribe(['name'], subscriber);
		store.state.name = 'baz';
		expect(isSubscribed).to.be.true;
	});
	it('Subscribed callbacks registered with specific properties should not run on changes to nested properties of state.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => prop === 'name' ? isSubscribed = true : null;
		store.subscribe(['name'], subscriber);
		store.state.obj.name = 'baz';
		expect(isSubscribed).to.be.false;
	});
});