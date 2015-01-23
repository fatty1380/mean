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
        vm.imageURL = vm.user.profileImageURL;

        console.log('[CompaniesCtrl] Init w/ Company: %o', vm.company);

        if (!!vm.company) {
            vm.canEdit = !!vm.config.edit && !!vm.company.owner && vm.company.owner._id === Authentication.user._id;

            if (!!vm.company.name) {
                var name = vm.company.name;

                if (name.charAt(name.length - 1).toLowerCase() === 's') {
                    vm.titleText = name + '\' Profile';
                } else {
                    vm.titleText = name + '\'s Profile';
                }
            }

            vm.imageURL = vm.company.profileImageURL || vm.user.profileImageURL;
        }
        else if ($state.is('companies.home')) {
            vm.canEdit = !!vm.config.edit;
        } else {
            debugger;
        }

        // Change Picture Success method:
        vm.successFunction = function (fileItem, response, status, headers) {
            // Populate user object
            vm.company = response;
            vm.imageURL = vm.company.profileImageURL;

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
