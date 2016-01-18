/* global _ */
/* global logger */

(function () {
    'use strict';

    angular
        .module('company')
        .controller('JobDetailsCtrl', JobDetailsCtrl);

    JobDetailsCtrl.$inject = ['$state', 'parameters', 'userService', 'LoadingService', 'CompanyService', 'companyModalService', 'LoadingService'];

    function JobDetailsCtrl($state, parameters, UserService, LoadingService, CompanyService, companyModalService, Loader) {

        var vm = this;

        vm.job = parameters.entry;
        vm.user = parameters.user || {};
        vm.applicationStatus = null;
        vm.appliedText = 'Application in process';

        vm.apply = launchApplication;
        vm.share = share;

        activate();
        
       // launchApplication();
        
        /////////////////////////////////////////////////////////////
        
        function activate() {
            if (_.isEmpty(vm.job)) {
                logger.error('No Job has been loaded into the Controller', parameters);
                LoadingService.showAlert('Sorry, job not available');
                return vm.close();
            }

            UserService.getUserData()
                .then(function (user) {
                    _.extend(vm.user, user);
                });
                
            CompanyService.getJobApplicationStatus(vm.job)
                .then(function success(res) {
                    vm.applicationStatus = res.status;
                    if (!_.isEmpty(res.buttonText)) {
                        vm.appliedText = res.buttonText;
                    }
                });
        }
        
        function launchApplication() {
            companyModalService.showJobApplicationModal({ user: vm.user, job: vm.job })
                .then(function modalResult(res) {
                    vm.applicationStatus = res.status;
                    if (!_.isEmpty(res.buttonText)) {
                        vm.appliedText = res.buttonText;
                    }
                });
        }

        function share() {

        }
    }
})();