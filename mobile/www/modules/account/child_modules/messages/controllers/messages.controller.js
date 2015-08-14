(function () {
    'use strict';

    angular
        .module('messages')
        .controller('messagesCtrl', messagesCtrl);

    messagesCtrl.$inject = ['messageService'];

    function messagesCtrl (messageService) {
        var vm  = this;

        vm.messageService = messageService;

    }

})();
