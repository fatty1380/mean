(function () {
    'use strict';

    angular
        .module('company')
        .factory('companyModalService', companyModalService);

    companyModalService.$inject = ['modalService'];

    function companyModalService (modalService) {
        var templateUrl, controller, params,
            defaultOptions = { animation: 'slide-in-up' };

        function showJobDetailsModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/company/templates/job.template.html';
            controller = 'JobDetailsCtrl as vm';
            params = parameters || {};
            options = angular.extend({animation: 'slide-left-right'}, defaultOptions, options);
            
            return modalService
                .show(templateUrl, controller, params);
        }

        return {
            showJobDetailsModal: showJobDetailsModal
        };
    }
})();
