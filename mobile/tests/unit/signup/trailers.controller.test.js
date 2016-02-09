'use strict';

(function() {
    describe('trailersCtrl ', function() {

        var trailersCtrl,
            registerService,
            $httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
            $httpBackend = $injector.get('$httpBackend');
            registerService = $injector.get('registerService');
        }));

        beforeEach(inject(function($rootScope, $controller){
            var scope = $rootScope.$new();
            trailersCtrl = $controller('TrailersCtrl', {
                $scope: scope
            });
        }));

        it('has at least one trailer', function() {
            expect(trailersCtrl.trailers.length).toBeGreaterThan(0);
        });

      /*  it('should put data', function(settings) {
            var dataProps = {
                handle: "handle",
                props:{
                    truck: "some truck",
                    trailer: "some trailer",
                    started: "some date"
                }
            };

            $httpBackend.expect('PUT', settings.users)
                .respond(200, {});

            registerService.updateUser(dataProps)
                .then(function(data) {
                    console.log("&&&&&& ",data.success);
                    expect(data.success).toBeTruthy();
                });

            $httpBackend.flush();
        });*/

    });
}());
