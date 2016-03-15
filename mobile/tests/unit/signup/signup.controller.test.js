'use strict';

(function () {
    describe('signupCtrl ', function () {

        var signupCtrl;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function ($injector) {
            var $controller = $injector.get('$controller');
        }));

        beforeEach(inject(function ($rootScope, $controller) {
            var scope = $rootScope.$new();
            signupCtrl = $controller('SignupCtrl', {
                $scope: scope
            });
        }));

        it('set form', function () {
            var form = { testKey: 'testValue' };

            signupCtrl.initEngagementForm(form);
            expect(signupCtrl.form).toEqual(form);
        });

    });
}());
