'use strict';

describe('Feeds E2E Tests:', function() {
	describe('Test Feeds page', function() {
		it('Should not include new Feeds', function() {
			browser.get('http://localhost:3000/#!/feeds');
			expect(element.all(by.repeater('feed in feeds')).count()).toEqual(0);
		});
	});
});
