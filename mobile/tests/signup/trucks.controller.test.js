'use strict';

(function() {

    describe('trucksCtrl ', function() {
        // Initialize global variables
        var trucksCtrl,
            httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
            httpBackend = $injector.get('$httpBackend');
        }));

        beforeEach(inject(function($rootScope, $controller){
           var scope = $rootScope.$new();
            trucksCtrl = $controller('trucksCtrl', {
                 $scope: scope
            });
        }));

        it('has at least one truck', function() {
            expect(trucksCtrl.trucks.length).toBeGreaterThan(0);
        });

    });
}());
