'use strict';

describe('Applications E2E Tests:', function() {

    describe('Test Application List Page', function() {
        it('Should report missing credentials', function() {
            browser.get('/applications');
            expect(element.all(by.repeater('application in applications')).count()).toEqual(0);
        });

        it('should have a job loaded', function() {
            browser.get('/applications/create');
        });
    });
});
