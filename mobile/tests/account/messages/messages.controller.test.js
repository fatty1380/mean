'use strict';

(function() {

    describe('MessagesCtrl ', function() {
        var MessagesCtrl,
            httpBackend;

        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function($injector) {
            var $controller = $injector.get('$controller');
            httpBackend = $injector.get('$httpBackend');
        }));

        beforeEach(inject(function($rootScope, $controller){
            var scope = $rootScope.$new();
            MessagesCtrl = $controller('MessagesCtrl', {
                $scope: scope,
                recipientChat: 'test chat'
            });
        }));

        it('is defined', function() {
            expect(MessagesCtrl).toBeDefined();
        });

        it('should contain method openChatDetails()', function() {
            expect(MessagesCtrl.openChatDetails).toBeDefined();
        });

    });
}());
