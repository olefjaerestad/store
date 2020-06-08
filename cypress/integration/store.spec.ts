/// <reference types="cypress" />

import { Store } from '../../src/store';

const store = new Store(
	{
		name: 'My name',
		age: 123,
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
		expect(isSubscribed).to.equal(true);
	});
	it('Should be unsubscribeable.', () => {
		let isSubscribed = false;
		const subscriber = (prop: string) => prop === 'name' ? isSubscribed = true : null;
		store.subscribe(subscriber);
		store.unsubscribe(subscriber);
		store.state.name = 'My new name';
		expect(isSubscribed).to.equal(false);
	});
});