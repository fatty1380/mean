(function () {
    'use strict';

    function CompanyEditController($state, $log, Companies, company) {
        var vm = this;

        vm.company = company;
        vm.submit = submit;
        vm.cancel = cancel;
        vm.submitClass = '';
        vm.editName = false;

        function activate() {
            if (!vm.company) {
                $log.error('[CompanyEditController] No company available in state %s', $state.current.name);
            }
            if($state.is('companies.create')) {
                vm.submitText = 'Create';
                vm.pageTitle = 'Create your new company profile';
                vm.editName = true;
                vm.editing = true;
            } else if($state.is('companies.edit')) {
                vm.submitText = 'Update';
                vm.pageTitle = vm.company.name;
                vm.hasTitle = true;
            } else if($state.is('companies.remove')) {
                vm.submit = remove;
                vm.submitText = 'Remove';
                vm.submitClass = 'btn-danger';
            }
        }

        activate();

        function submit() {
            if(vm.company._id) {
                return update();
            } else {
                return create();
            }
        }

        // Create new Company
        function create() {
            // Create new Company object
            var company = new Companies.ById(vm.company);

            // Redirect after save
            company.$save(function(response) {
                $state.go('companies.home', {companyId: response._id});

                // Clear the form object
                vm.company = null;
            }, function(errorResponse) {
                vm.error = errorResponse.data.message || errorResponse.data.error.message;
            });
        }

        // Remove existing Company
        function remove() {
                vm.company.$remove(function() {
                    $state.go('home');
                });
        }

        // Update existing Company
        function update() {
            var company = vm.company;

            company.$update(function() {
                $state.go('companies.home', {companyId: company._id});
            }, function(errorResponse) {
                vm.error = errorResponse.data.message;
            });
        }

        function cancel() {
            // TODO: Double check for chagnes
            $state.go('home');
        }
    }

    CompanyEditController.$inject = ['$state', '$log', 'Companies', 'company'];

    angular.module('companies')
        .controller('CompanyEditController', CompanyEditController);

})
();
