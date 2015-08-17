'use strict';

describe('Messages E2E Tests:', function() {
	describe('Test Messages page', function() {
		it('Should not include new Messages', function() {
			browser.get('http://localhost:3000/#!/messages');
			expect(element.all(by.repeater('message in messages')).count()).toEqual(0);
		});
	});
});
