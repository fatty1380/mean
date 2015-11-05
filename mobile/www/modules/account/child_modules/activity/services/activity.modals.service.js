(function () {
    'use strict';

    angular
        .module('activity')
        .factory('activityModalsService', activityModalsService);

    activityModalsService.$inject = ['modalService'];

    function activityModalsService (modalService) {
        var templateUrl, controller, params,
            defaultOptions = { animation: 'slide-in-up' };

        function showAddActivityModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/activity/templates/activity-add.html';
            controller = 'ActivityAddCtrl as vm';
            params = parameters || {};
            options = angular.extend({}, defaultOptions, options);
            
            return modalService
                .show(templateUrl, controller, params);
        }
        function showActivityDetailsModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/activity/templates/activity-details.html';
            controller = 'ActivityDetailsCtrl as vm';
            params = parameters || {};
            options = angular.extend({animation: 'slide-left-right'}, defaultOptions, options);
            
            return modalService
                .show(templateUrl, controller, params);
        }

        return {
            showAddActivityModal: showAddActivityModal,
            showActivityDetailsModal: showActivityDetailsModal
        };
    }
})();
