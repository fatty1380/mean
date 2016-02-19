'use strict';

(function () {

    describe('ActivityCtrl ', function () {
        var ActivityCtrl,
            httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function ($injector) {
            var $controller = $injector.get('$controller');
            httpBackend = $injector.get('$httpBackend');
        }));

        beforeEach(inject(function ($rootScope, $controller) {
            var scope = $rootScope.$new();
            ActivityCtrl = $controller('ActivityCtrl', {
                $scope: scope
            });
        }));

        it('is defined', function () {
            expect(ActivityCtrl).toBeDefined();
        });

        it('is lastUpdate defined', function () {
            expect(ActivityCtrl.lastUpdate).toBeDefined();
        });

        it('is newActivities === 0', function () {
            expect(ActivityCtrl.newActivities).toBe(0);
        });

    });
}());
