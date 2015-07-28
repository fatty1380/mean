'use strict';

(function() {
    describe('Signin ', function() {

        var signinCtrl,
            $httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
           // $httpBackend = $injector.get('$httpBackend');
        }));

        beforeEach(inject(function($rootScope, $controller){
            var scope = $rootScope.$new();
            signinCtrl = $controller('signinCtrl', {
                $scope: scope
            });
        }));

        it('has user', function() {
            expect(signinCtrl.user).toBeDefined();
        });


        it('set form', function() {
            var form = {testKey: "testValue"}
            signinCtrl.initForm(form);
            expect(signinCtrl.form).toEqual(form);
        });

    });
}());
