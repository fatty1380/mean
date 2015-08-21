'use strict';

(function() {

    describe('lockboxCtrl ', function() {
        var lockboxCtrl,
            httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
            httpBackend = $injector.get('$httpBackend');
        }));

        beforeEach(inject(function($rootScope, $controller){
            var scope = $rootScope.$new();
            lockboxCtrl = $controller('LockboxCtrl', {
                $scope: scope
            });
        }));

        it('has documents', function() {
            expect(lockboxCtrl.lockboxDocuments.docs.length).toBeGreaterThan(0);
        });

        it('has correct documents', function() {
            var docs = lockboxCtrl.lockboxDocuments.docs;
            for(var i=0; i<docs.length; i++){
                expect(docs[i].url.length).toBeGreaterThan(0);
                expect(docs[i].sku.length).toBeGreaterThan(0);
            }
        });

    });
}());
