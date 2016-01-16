(function () {
    'use strict';

    angular
        .module('company')
        .controller('JobDetailsCtrl', JobDetailsCtrl);

    JobDetailsCtrl.$inject = ['$state', 'parameters', 'userService', 'CompanyService', 'companyModalService', 'LoadingService'];

    function JobDetailsCtrl($state, parameters, UserService, CompanyService, companyModalService, Loader) {

        var vm = this;

        vm.job = parameters.entry;
        vm.user = parameters.user || {};

        vm.apply = launchApplication;
        vm.share = share;

        activate();
        
       // launchApplication();
        
        /////////////////////////////////////////////////////////////
        
        function launchApplication() {
            //Loader.showLoader('Hello', { duration: 0 });
            companyModalService.showJobApplicationModal({ user: vm.user, job: vm.job });
        }
        
        function activate() {
            if (_.isEmpty(vm.job)) {
                logger.error('No Job has been loaded into the Controller', parameters);
                return vm.close();
            }

            UserService.getUserData()
                .then(function (user) {
                    _.extend(vm.user, user);
                });

        }
        
        function validate() {
            vm.loading = true;
            Loader.showLoader('Validating Application');
            
            return CompanyService.validateApplication(vm.user, vm.job)
                .then(function pass(result) {
                    apply();
                    return null;
                })
                .catch(function respondToErrors(err) {
                    
                    if (err.type === 'required') {
                        if (err.field === 'experience') {
                            Loader.showAlert('Please enter experience on your profile page');
                        }
                        else if (err.field === 'address') {
                            Loader.showAlert('Please enter your address on your profile edit page');
                        }
                        else {
                            Loader.showAlert('Please enter your ' + err.field + ' before applying');
                        }
                    }
                        else {
                        Loader.showFailure('Validation Failed');
                    }
                    
                    vm.loading = false;
                });
        }

        function apply() {
            vm.loading = true;

            Loader.showLoader('Processing Application');

            CompanyService.applyToJob(vm.job.id)
                .then(function handleSuccess(application) {
                    logger.info('Applied to Job Successfully!!!', application);
                    Loader.showSuccess('Application Successful!<br><small>Thanks for applying with Core-Mark</small>');

                    vm.disableApplication = true;
                })
                .catch(function handleError(error) {
                    logger.error('Job Application failed', error);
                    Loader.showFailure('Application Failed');

                    vm.loading = false;
                });
        }

        function share() {

        }
    }
})();