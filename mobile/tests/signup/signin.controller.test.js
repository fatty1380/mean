'use strict';

(function() {
    describe('Signin ', function() {

        var signinCtrl,
            registerService,
            $httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
            registerService = $injector.get('registerService');
            $httpBackend = $injector.get('$httpBackend');
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


        it('should get token success', function() {
            var responseToken = {
                access_token: "fa182d42a97cdd5e730b5129c216981269c71dfe8e00442b286c00179b53f287",
                refresh_token: "a8c29d67114f5585cf6f27cfe6e0d837f8eb95b29b1d1ca3a7599bd6af58cd10",
                expires_in: 2592000000,
                token_type: "Bearer"
            };
            var url = "http://outset-d.elasticbeanstalk.com/oauth/token/";
            $httpBackend.expect('POST', url)
                .respond(200, responseToken);

            registerService.signIn({ email: "test@test.com", password: "somepassword" })
                .then(function(data) {
                    expect(data.success).toBeTruthy();
                });

            $httpBackend.flush();
        });

        it('should get token error', function() {
            var responseError = {
                error: "invalid_grant",
                error_description: "Invalid resource owner credentials"
            }
            var url = "http://outset-d.elasticbeanstalk.com/oauth/token/";
            $httpBackend.expect('POST', url)
                .respond(403, responseError);

            registerService.signIn({ email: "test@test.com", password: "somepassword" })
                .then(function(data) {
                    expect(data.success).toBeFalsy();
                });

            $httpBackend.flush();
        });

    });
}());
