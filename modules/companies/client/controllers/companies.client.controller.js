(function () {
    'use strict';

    // Companies controller
    function CompaniesController($state, auth, company, moduleConfig, Jobs) {
        var vm = this;

        vm.user = auth.user;
        vm.company = company;
        vm.owner = company && company.owner;
        vm.config = moduleConfig || {};

        vm.canEdit = false;
        vm.titleText = 'Company Profile';
        vm.imageURL = 'modules/companies/img/profile/default.png';

        console.log('[CompaniesCtrl] Init w/ Company: %o', vm.company);

        function activate() {
            if (auth.isLoggedIn() && vm.company.owner.id === vm.user.id) {
                vm.canEdit = true;
                vm.titleText = 'Company Profile';
                vm.subtitle = 'Hi ' + vm.user.firstName + ', Welcome to Outset!';
            } else {
                vm.canEdit = false;
                vm.titleText = vm.company.name;
                vm.subtitle = 'Welcome to the home of ' + vm.company.name + ' on Outset!';

                Jobs.ById.query({company: vm.company.id}).$promise
                    .then(function (success) {
                        vm.jobs = success;
                    })
                    .catch(function (err) {
                        console.log('job list failed', err);
                    });
            }
            vm.imageURL = vm.company.profileImageURL || vm.imageURL;

        }

        // Change Picture Success method:
        vm.successFunction = function (fileItem, response, status, headers) {
            // Populate user object
            vm.company = response;
            vm.imageURL = vm.company.profileImageURL || vm.imageURL;

            vm.showPhotoEdit = false;
            vm.hideModal();
        };

        vm.showPhotoEdit = false;

        vm.showModal = function () {
            vm.showPhotoEdit = true;

            // check about 'vm.photoEdit' modal
        };

        vm.hideModal = function () {
            vm.showPhotoEdit = false;
        };

        activate();
    }

    CompaniesController.$inject = ['$state', 'Authentication', 'company', 'config', 'Jobs'];

    angular.module('companies').controller('CompaniesController', CompaniesController);
})();
