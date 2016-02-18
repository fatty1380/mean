(function () {
    'use strict';

    angular
        .module('company')
        .factory('companyModalService', companyModalService);

    companyModalService.$inject = ['modalService'];

    function companyModalService (modalService) {
        var templateUrl, controller, params,
            defaultOptions = { animation: 'slide-in-up' };

        return {
            showJobDetailsModal: showJobDetailsModal,
            showJobApplicationModal: showJobApplicationModal
        };

        function showJobDetailsModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/company/templates/job.template.html';
            controller = 'JobDetailsCtrl as vm';
            params = parameters || {};
            options = angular.extend({ animation: 'slide-left-right' }, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params);
        }

        /**
         * @param parameters Object containing required properties for the controller
         *  @enum {job} An object representing a job in the system
         *  @enum {validators} An array representing an array of validators @optional
         *  @enum {user} The User Object to validate against @optional
         */
        function showJobApplicationModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/company/templates/application.mobile.template.html';
            controller = 'JobApplicationCtrl as vm';
            params = parameters || {};
            options = angular.extend({ animation: 'slide-left-right' }, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params);
        }
    }
})();
