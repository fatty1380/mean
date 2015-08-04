(function () {
    'use strict';

    var messagesCtrl = function (messageService) {
        var vm  = this;

        vm.messageService = messageService;


    };

    messagesCtrl.$inject = ['messageService'];

    angular
        .module('messages')
        .controller('messagesCtrl', messagesCtrl);

})();
