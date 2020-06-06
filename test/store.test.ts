import { Store } from '../src/store';
const {
	expect,
} = require('chai');

const store = new Store({
	name: 'My name',
	age: 123,
}, {
	setName: function(name: string) {
		this.state.name = name;
	}
});

describe('Store', () => {
	it('Should update state when using actions.', () => {
		const newName = 'My new name';
		store.actions.setName(newName);
		expect(store.state.name).to.equal(newName);
	});
	it('Should be subscribeable.', () => {
		let subscribeIsWorking = false;
		const subscriber = (prop, val, prevVal) => prop === 'name' ? subscribeIsWorking = true : null;
		store.subscribe(subscriber);
		store.state.name = 'My new name';
		expect(subscribeIsWorking).to.be.true;
	});
	it('Should be unsubscribeable.', () => {
		let subscribeIsWorking = false;
		const subscriber = (prop, val, prevVal) => prop === 'name' ? subscribeIsWorking = true : null;
		store.subscribe(subscriber);
		store.unsubscribe(subscriber);
		store.state.name = 'My new name';
		expect(subscribeIsWorking).to.be.false;
	});
})