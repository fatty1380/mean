(function () {
    'use strict';

    describe("Register Service ", function() {

        var service,
            injector,
            $httpBackend;

        var responseToken = {
            access_token: "fa182d42a97cdd5e730b5129c216981269c71dfe8e00442b286c00179b53f287",
            refresh_token: "a8c29d67114f5585cf6f27cfe6e0d837f8eb95b29b1d1ca3a7599bd6af58cd10",
            expires_in: 2592000000,
            token_type: "Bearer"
        };

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            service = $injector.get('registerService');
            var $controller = $injector.get('$controller');
             $httpBackend = $injector.get('$httpBackend');

            inject(function($injector, settings) {
                injector = $injector;
                $httpBackend.when('POST', settings.signup).respond(responseToken);
            });
        }));


        it('defined',function() {
            expect(service).toBeDefined();
        });

    });

})();
