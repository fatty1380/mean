(function () {
    'use strict';

    angular
        .module('activity')
        .factory('activityModalsService', activityModalsService);

    activityModalsService.$inject = ['modalService'];

    function activityModalsService (modalService) {
        var templateUrl, controller, params;

        function showAddActivityModal (parameters) {
            templateUrl = 'modules/account/child_modules/activity/templates/activity-add.html';
            controller = 'ActivityAddCtrl as vm';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params);
        }
        function showActivityDetailsModal (parameters) {
            templateUrl = 'modules/account/child_modules/activity/templates/activity-details.html';
            controller = 'ActivityDetailsCtrl as vm';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params);
        }
        function showWelcomeModal (parameters) {
            templateUrl = 'modules/account/child_modules/activity/templates/activity-welcome.html';
            controller = 'ActivityWelcomeCtrl as vm';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params);
        }
        function showCommentEditModal (parameters) {
            templateUrl = 'modules/account/child_modules/activity/templates/activity-comment-edit.html';
            controller = 'ActivityCommentEditCtrl as vm';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params);
        }

        return {
            showAddActivityModal: showAddActivityModal,
            showActivityDetailsModal: showActivityDetailsModal,
            showWelcomeModal: showWelcomeModal,
            showCommentEditModal: showCommentEditModal
        };
    }
})();
