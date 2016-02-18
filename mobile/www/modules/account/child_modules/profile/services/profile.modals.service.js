(function () {
    'use strict';

    angular
        .module('profile')
        .factory('profileModalsService', profileModalsService);

    profileModalsService.$inject = ['modalService', 'lockboxModalsService'];

    function profileModalsService (modalService, lockboxModalsService) {
        var templateUrl, controller, params,
            defaultOptions = { animation: 'slide-in-up' };

        return {
            showProfileEditModal: showProfileEditModal,
            showProfileShareModal: showProfileShareModal,
            showRequestReviewModal: showRequestReviewModal,
            showAddFriendsModal: showAddFriendsModal,
            showFriendRequestModal: showFriendRequestModal,
            showFriendManualAddModal: showFriendManualAddModal,
            showProfileEditTrailersModal: showProfileEditTrailersModal,
            showProfileEditTrucksModal: showProfileEditTrucksModal,
            showProfileEditLicenseModal: showProfileEditLicenseModal,
            showProfileEditAddressModal: showProfileEditAddressModal,
            showListExperienceModal: showListExperienceModal,
            showAddExperienceModal: showAddExperienceModal,
            showEditExperienceModal: showEditExperienceModal
        };

        /** Method Implementation */

        function showProfileEditModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-edit.html';
            controller = 'ProfileEditCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showProfileShareModal (parameters, options) {
            return lockboxModalsService.showShareModal(parameters, options);
        }

        function showRequestReviewModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-request.html';
            controller = 'ProfileRequestReviewCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showAddFriendsModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-friends-add.html';
            controller = 'AddFriendsCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showFriendRequestModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-friend-requests.html';
            controller = 'ProfileFriendRequestCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showFriendManualAddModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-friends-manual-add.html';
            controller = 'ManualFriendsAddCtrl as vm';
            params = parameters || {};
            options = angular.extend({}, defaultOptions, options);

            return modalService
                .show(templateUrl, controller, params, options);
        }

        function showProfileEditTrailersModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-edit-trailers.html';
            controller = 'ProfileEditTrailersCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showProfileEditTrucksModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-edit-trucks.html';
            controller = 'ProfileEditTrucksCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showProfileEditLicenseModal (parameters, options) {
            templateUrl = 'modules/signup/templates/license.modal.html';
            controller = 'ProfileEditLicenseCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showProfileEditAddressModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-edit-address.html';
            controller = 'ProfileEditAddressCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showListExperienceModal (parameters, options) {
            controller = 'ProfileExperienceListCtrl as vm';
            templateUrl = 'modules/account/child_modules/profile/templates/profile-experience-list.html';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showAddExperienceModal (parameters, options) {
            controller = 'ProfileAddExperienceCtrl as vm';
            templateUrl = 'modules/account/child_modules/profile/templates/profile-experience-edit.html';

            return showModal(templateUrl, controller, parameters, options);
        }

        function showEditExperienceModal (parameters, options) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-experience-edit.html';
            controller = 'ProfileEditExperienceCtrl as vm';

            return showModal(templateUrl, controller, parameters, options);
        }

        /** Private Methods */

        function showModal (template, controller, params, options) {
            params = params || {};
            options = angular.extend({}, defaultOptions, options);
            return modalService
                .show(templateUrl, controller, params, options);
        }
    }
})();
