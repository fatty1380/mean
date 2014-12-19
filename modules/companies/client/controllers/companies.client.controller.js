(function() {
    'use strict';

    // Companies controller
    function CompaniesController($scope, $state, $stateParams, $location, Authentication, Companies, company) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;
        vm.company = company;

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
            if ($state.is('companies.home') || $stateParams.companyId === 'home') {
                vm.findByUser(vm.user);
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

        // Change Picture Success method:
        vm.successFunction = function (fileItem, response, status, headers) {
            debugger;
            // Populate user object
            vm.company = response;

            vm.showPhotoEdit = false;
        };

        vm.showPhotoEdit = false;

        vm.showModal = function() {
            vm.showPhotoEdit = true;

            // check about 'vm.photoEdit' modal
        };

        vm.hideModal = function() {
            vm.showPhotoEdit = false;
        };
    }

    CompaniesController.$inject = ['$scope', '$state', '$stateParams', '$location', 'Authentication', 'Companies', 'company'];

    angular.module('companies').controller('CompaniesController', CompaniesController);
})();
