(function () {
    'use strict';

    angular
        .module('messages')
        .factory('messageModalsService', messageModalsService);

    messageModalsService.$inject = ['modalService'];

    function messageModalsService (modalService) {
        var templateUrl, controller, params;

        function showNewMassageModal (parameters) {
            templateUrl = 'modules/account/child_modules/messages/templates/message-new.html';
            controller = 'MessageNewCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }

        return {
            showNewMassageModal: showNewMassageModal
        };

    }

})();
