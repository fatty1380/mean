'use strict';

(function() {
    describe('trailersCtrl ', function() {
        // Initialize global variables
        var trailersCtrl,
            httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
            httpBackend = $injector.get('$httpBackend');
        }));

        beforeEach(inject(function($rootScope, $controller){
            var scope = $rootScope.$new();
            trailersCtrl = $controller('trailersCtrl', {
                $scope: scope
            });
        }));

        it('has at least one trailer', function() {
            expect(trailersCtrl.trailers.length).toBeGreaterThan(0);
        });

    });
}());
