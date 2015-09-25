(function () {
    'use strict';

    angular
        .module('lockbox')
        .factory('lockboxModalsService', lockboxModalsService);

    lockboxModalsService.$inject = ['modalService'];

    function lockboxModalsService(modalService) {
        var templateUrl, controller, params,
            defaultOptions = { animation: 'slide-in-up' };

        function showEditModal(parameters, options) {
            templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-edit.html';
            controller = 'LockboxEditCtrl as vm';
            params = parameters || {};
            options = angular.extend({}, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params, options);
        }

        
        function showCreateModal(parameters, options) {
            templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-create.html';
            controller = 'LockboxCreateCtrl as vm';
            params = parameters || {};
            options = angular.extend({}, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params, options);
        }

        function showShareModal(parameters, options) {
            templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-share.html';
            controller = 'LockboxShareCtrl as vm';
            params = parameters || {};
            options = angular.extend({}, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params, options);
        }

        function showShareContactModal(parameters, options) {
            templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-share-contacts.html';
            controller = 'LockboxShareContactsCtrl as vm';
            params = parameters || {};
            options = angular.extend({}, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params, options);
        }

        return {
            showCreateModal: showCreateModal,
            showEditModal: showEditModal,
            showShareModal: showShareModal,
            showShareContactModal: showShareContactModal
        };
    }
})();
