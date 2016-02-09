(function () {
    'use strict';

    describe("Messages Service:", function() {

        // mock app module
        beforeEach(module(AppConfig.appModuleName));

        // test module to contain messageService
        it('should contain a messageService', inject(function (messageService) {
            expect(messageService).toBeDefined();
        }));

        // test module to contain messageService
        it('getMessages() should return promise', inject(function (messageService) {
            expect(messageService.getMessages().then).toBeFunction();
        }));

        // test module to contain getChats promise
        it('getChats() return promise', inject(function (messageService) {
            expect(messageService.getChats().then).toBeFunction();
        }));

        // returns promise
        it('getChatByUserId() return promise', inject(function (messageService) {
            expect(messageService.getChatByUserId().then).toBeFunction();
        }));

        // returns promise
        it('getChats() return promise', inject(function (messageService) {
            expect(messageService.getChats('www').then).toBeFunction();
        }));

        // returns promise
        it('createMessage() return promise', inject(function (messageService) {
            expect(messageService.createMessage().then).toBeFunction();
        }));
    });
})();
