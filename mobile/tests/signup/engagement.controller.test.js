'use strict';

(function() {
    describe('engagementCtrl ', function() {

        var engagementCtrl;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
        }));

        beforeEach(inject(function($rootScope, $controller){
            var scope = $rootScope.$new();
            engagementCtrl = $controller('engagementCtrl', {
                $scope: scope
            });
        }));

        it('set form', function() {
            var form = {testKey: "testValue"}
            engagementCtrl.initEngagementForm(form);
            expect(engagementCtrl.form).toEqual(form);
        });

    });
}());
