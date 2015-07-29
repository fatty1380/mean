'use strict';

describe('Documents E2E Tests:', function() {
	describe('Test Documents page', function() {
		it('Should not include new Documents', function() {
			browser.get('http://localhost:3000/#!/documents');
			expect(element.all(by.repeater('document in documents')).count()).toEqual(0);
		});
	});
});
