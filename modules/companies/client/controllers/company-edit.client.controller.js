(function () {
    'use strict';

    function CompanyEditController($state, $log, auth, Companies, company) {

        if(!auth.user) {
            return $state.go('intro');
        }
        else if (!!company && typeof auth.user.company === 'string' && auth.user.company !== company._id) {
            return $state.go('home');
        }
        else if (!!company && !!auth.user.company && typeof auth.user.company === 'object' &&  auth.user.company._id === company._id) {
            return $state.go('home');
        }

        var vm = this;

        vm.company = company;
        vm.user = auth.user;
        vm.submit = submit;
        vm.cancel = cancel;
        vm.submitClass = '';
        vm.editName = false;
        vm.editGW = false;

        vm.options = {
            language: 'en',
            allowedContent: true,
            entities: false
        };

        vm.onReady = function() {
            $log.info('CompanyEditController onReady called');
        }
        function activate() {
            if ($state.is('companies.create')) {
                if (!vm.company || _.isEmpty(vm.company)) {
                    $log.debug('no existing company object, creating a blank stub');
                    vm.company = {
                        ownerId: auth.user._id
                    };
                }
            }

            if (!vm.company || _.isEmpty(vm.company)) {
                $log.error('[CompanyEditController] No company available in state %s', $state.current.name);
            }
            else if ($state.is('companies.create')) {
                vm.submitText = 'Create';
                vm.pageTitle = 'Create your new company profile';
                vm.editName = true;
                vm.editing = true;
            } else if ($state.is('companies.edit')) {
                vm.submitText = 'Update';
                vm.pageTitle = vm.company.name;
                vm.hasTitle = true;
            } else if ($state.is('companies.remove')) {
                vm.submit = remove;
                vm.submitText = 'Remove';
                vm.submitClass = 'btn-danger';
            }

        }

        activate();

        function submit() {
            if (vm.company._id) {
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
            company.$save(function (response) {
                $state.go('companies.home', {companyId: response._id});

                // Clear the form object
                vm.company = null;
            }, function (errorResponse) {
                $log.error('Unable to Create Company', errorResponse);
                vm.error = errorResponse.data.message || errorResponse.data.error.message;
            });
        }

        // Remove existing Company
        function remove() {
            vm.company.$remove(function () {
                $state.go('home');
            });
        }

        // Update existing Company
        function update() {
            var company = vm.company;

            company.$update(function () {
                $state.go('companies.home', {companyId: company._id});
            }, function (errorResponse) {
                $log.error('Unable to Update Company', errorResponse);
                vm.error = errorResponse.data.message;
            });
        }

        function cancel() {
            // TODO: Double check for chagnes
            $state.go('home');
        }
    }

    function CKEditorDirective($log) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ngModel) {
                ngModel.$render = function() {

                };
            }
        };
    }

    CompanyEditController.$inject = ['$state', '$log', 'Authentication', 'Companies', 'company'];
    angular.module('companies')
        .controller('CompanyEditController', CompanyEditController);

})
();
