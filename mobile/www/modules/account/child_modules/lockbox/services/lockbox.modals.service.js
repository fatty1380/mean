(function () {
    'use strict';

    angular
        .module('lockbox')
        .factory('lockboxModalsService', lockboxModalsService);

    lockboxModalsService.$inject = ['modalService'];

    function lockboxModalsService(modalService) {
        var templateUrl, controller, params,
            defaultOptions = { animation: 'slide-in-up' };

        function showLockboxEditModal(parameters, options) {
            templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-edit.html';
            controller = 'LockboxEditCtrl as vm';
            params = parameters || {};
            options = angular.extend({}, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params, options);
        }

        function showLockboxShareModal(parameters, options) {
            templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-share.html';
            controller = 'LockboxShareCtrl as vm';
            params = parameters || {};
            options = angular.extend({}, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params, options);
        }

        return {
            showLockboxEditModal: showLockboxEditModal,
            showLockboxShareModal: showLockboxShareModal
        };
    }
})();
