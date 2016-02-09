'use strict';

(function() {

    describe('LockboxCtrl ', function() {
        var LockboxCtrl,
            httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
            httpBackend = $injector.get('$httpBackend');
        }));

        beforeEach(inject(function($rootScope, $controller){
            var scope = $rootScope.$new();
            LockboxCtrl = $controller('LockboxCtrl', {
                $scope: scope
            });
        }));

        it('is defined', function() {
            expect(LockboxCtrl).toBeDefined();
        });
    });
}());
