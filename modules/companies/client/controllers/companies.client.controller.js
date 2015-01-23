(function () {
    'use strict';

    // Companies controller
    function CompaniesController($scope, $state, $stateParams, $location, Authentication, Companies, company, moduleConfig) {
        var vm = this;

        vm.authentication = Authentication;
        vm.user = Authentication.user;
        vm.company = company;
        vm.config = moduleConfig || {};

        vm.canEdit = false;
        vm.titleText = 'Company Profile';
        vm.imageURL = '';

        if (!!vm.company) {
            vm.canEdit = !!vm.config.edit && vm.company.owner._id === Authentication.user._id;

            if(!!vm.company.name) {
                var name = vm.company.name;

                if(name.charAt(name.length-1).toLowerCase() === 's') {
                    vm.titleText = name + '\' Profile';
                } else {
                    vm.titleText = name + '\'s Profile';
                }
            }
        }
        else if ($state.is('companies.home')) {
            vm.canEdit = !!vm.config.edit;
        } else {
            debugger;
        }

        vm.imageURL = vm.company.profileImageURL || vm.user.profileImageURL;

        // REGION : CRUD Methods

        // Find a list of Companies
        vm.find = function () {
            vm.companies = Companies.ById.query();
        };

        vm.init = function () {
            if ($state.is('companies.home') || $stateParams.companyId === 'home') {
                vm.findByUser(vm.user);
            } else {
                vm.findOne();
            }
        };

        // Find existing Company
        vm.findOne = function () {
            vm.company = vm.company || Companies.ById.get({
                companyId: $stateParams.companyId
            });
        };

        vm.findOneByUser = function (user) {
            if (user.type === 'owner') {
                vm.company = Companies.ByUser.get({
                    userId: user._id
                });
            }
        };

        // Change Picture Success method:
        vm.successFunction = function (fileItem, response, status, headers) {
            // Populate user object
            vm.company = response;

            vm.showPhotoEdit = false;
        };

        vm.showPhotoEdit = false;

        vm.showModal = function () {
            vm.showPhotoEdit = true;

            // check about 'vm.photoEdit' modal
        };

        vm.hideModal = function () {
            vm.showPhotoEdit = false;
        };
    }

    CompaniesController.$inject = ['$scope', '$state', '$stateParams', '$location', 'Authentication', 'Companies', 'company', 'config'];

    angular.module('companies').controller('CompaniesController', CompaniesController);
})();
