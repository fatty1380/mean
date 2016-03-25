(function () {
    'use strict';

    angular
        .module('lockbox')
        .factory('lockboxModalsService', lockboxModalsService);

    lockboxModalsService.$inject = ['modalService'];

    function lockboxModalsService (modalService) {
        var defaultOptions = { animation: 'slide-in-up' };

        return {
            showCreateModal: showCreateModal,
            showEditModal: showEditModal,
            showShareModal: showShareModal,
            showOrderReportsModal: showOrderReportsModal,
            showResumeValidationModal: showResumeValidationModal
        };

        /** Implementation ------------------------------------------------------ */

        function showEditModal (params, options) {
            var templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-edit.html';
            var controller = 'LockboxEditCtrl as vm';

            return showModal(templateUrl, controller, params, options);
        }

        function showCreateModal (params, options) {
            var templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-create.html';
            var controller = 'LockboxCreateCtrl as vm';

            return showModal(templateUrl, controller, params, options);
        }

        function showShareModal (params, options) {
            var templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-share.html';
            var controller = 'LockboxShareCtrl as vm';

            return showModal(templateUrl, controller, params, options);
        }

        function showOrderReportsModal (params, options) {
            var templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-order-reports.html';
            var controller = 'LockboxOrderReportsCtrl as vm';

            return showModal(templateUrl, controller, params, options);
        }

        function showResumeValidationModal (params, options) {
            var templateUrl = 'modules/account/child_modules/lockbox/templates/lockbox-resume-validate.html';
            var controller = 'ResumeInfoCtrl as vm';

            return showModal(templateUrl, controller, params, options);

        }

        function showModal (templateUrl, controller, params, options) {
            var parameters = params || {};
            options = angular.extend({}, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, parameters, options);
        }
    }
})();
