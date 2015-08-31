(function () {
    'use strict';

    angular
        .module('lockbox')
        .factory('lockboxModalsService', lockboxModalsService);

    lockboxModalsService.$inject = ['modalService'];

    function lockboxModalsService (modalService) {
        var templateUrl, controller, params;

        function showLockboxEditModal (parameters) {
            templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-edit.html';
            controller = 'LockboxEditCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showLockboxShareModal (parameters) {
            templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-share.html';
            controller = 'LockboxShareCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        return {
            showLockboxEditModal: showLockboxEditModal,
            showLockboxShareModal: showLockboxShareModal
        };
    }
})();
