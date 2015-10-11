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

        return {
            showAddActivityModal: showAddActivityModal,
            showActivityDetailsModal: showActivityDetailsModal
        };
    }
})();
