(function() {
    'use strict';

    // Companies controller
    function CompaniesController($scope, $state, $stateParams, $location, Authentication, Companies, company) {
        var vm = this;

        console.log('coVal: %o', company);

        vm.authentication = Authentication;
        vm.imageURL = vm.authentication.user.profileImageURL; // TODO: Change to Company Image URL
        vm.company = company;

        function activate() {
                debugger;

            if (!!vm.company && !!vm.company._id) {
                console.log('hooray! %s', vm.company._id);
            } else if ($state.is('companies.me') || $stateParams.companyId === 'me') {
                vm.findOneByUser(vm.authentication.user);
            } else if ($state.is('companies.home') || $stateParams.companyId === 'home') {
                vm.findOneByUser(vm.authentication.user);
            } else {
                vm.findOne();
            }

        }


        // REGION : Page Action methods

        vm.makeCall = function() {
            window.location.href = 'tel://' + vm.company.phone;
        };

        vm.sendEmail = function() {
            window.location.href = 'mailto:' + vm.company.email + '?subject=Your Outset Company Profile' + '&body=Hello ' + vm.company.name + ',%0D%0AI saw your company profile on Outset and wanted to hear more.%0D%0A%0D%0AThank you,%0D%0A' + Authentication.user.firstName + '%0D%0A%0D%0A-------------%0D%0AView this Outset Profile here: ' + $location.$$absUrl;
        };

        vm.openChat = function() {
            alert('Sorry, but chat functionailty is not available at this time');
        };

        // REGION : CRUD Methods

        // Create new Company
        vm.create = function() {
            // Create new Company object
            var company = new Companies.ById(vm.company);

            debugger; //todo: confirm vm.company works

            // Redirect after save
            company.$save(function(response) {
                $location.path('companies/' + response._id);

                // Clear form fields
                vm.name = '';
            }, function(errorResponse) {
                vm.error = errorResponse.data.message;
            });
        };

        // Remove existing Company
        vm.remove = function(company) {
            if (company) {
                company.$remove();

                for (var i in vm.companies) {
                    if (vm.companies[i] === company) {
                        vm.companies.splice(i, 1);
                    }
                }
            } else {
                vm.company.$remove(function() {
                    $location.path('companies');
                });
            }
        };

        // Update existing Company
        vm.update = function() {
            var company = vm.company;

            company.$update(function() {
                $location.path('companies/' + company._id);
            }, function(errorResponse) {
                vm.error = errorResponse.data.message;
            });
        };

        // Find a list of Companies
        vm.find = function() {
            vm.companies = Companies.ById.query();
        };

        vm.init = function() {
            if ($state.is('companies.me') || $stateParams.companyId === 'me') {
                vm.findByUser(vm.authentication.user);
            } else {
                vm.findOne();
            }
        };

        // Find existing Company
        vm.findOne = function() {
            debugger;

            vm.company = vm.company || Companies.ById.get({
                companyId: $stateParams.companyId
            });
        };

        vm.findOneByUser = function(user) {
            if (user.type === 'owner') {
                vm.company = Companies.ByUser.get({
                    userId: user._id
                });
            }
        };



        activate();
    }

    CompaniesController.$inject = ['$scope', '$state', '$stateParams', '$location', 'Authentication', 'Companies', 'company'];

    angular.module('companies').controller('CompaniesController', CompaniesController);
})();
