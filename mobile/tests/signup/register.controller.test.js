'use strict';

(function() {
    describe('registerCtrl ', function() {

        var registerCtrl;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
        }));

        beforeEach(inject(function($rootScope, $controller){
            var scope = $rootScope.$new();
            registerCtrl = $controller('RegisterCtrl', {
                $scope: scope
            });
        }));

        it('set form', function() {
            var form = {testKey: "testValue"};

            registerCtrl.initForm(form);
            expect(registerCtrl.form).toEqual(form);
        });
        
        it('should register a user', function () {
            registerCtrl.vm.user = {
            firstName: 'Testing',
            lastName: 'Userman',
            email: 'test+user@test.com',
            password: 'password',
            confirmPassword: 'password'
            };

            registerCtrl.initForm = 
        });

    });
}());
