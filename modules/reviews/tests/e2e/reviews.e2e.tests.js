'use strict';

describe('Reviews E2E Tests:', function() {
	describe('Test Reviews page', function() {
		it('Should not include new Reviews', function() {
			browser.get('http://localhost:3000/#!/reviews');
			expect(element.all(by.repeater('review in reviews')).count()).toEqual(0);
		});
	});
});
