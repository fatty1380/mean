(function () {
    'use strict';

    angular
        .module('profile')
        .factory('profileModalsService', profileModalsService);

    profileModalsService.$inject = ['modalService'];

    function profileModalsService (modalService) {
        var templateUrl, controller, params;

        return {
            showProfileEditModal: showProfileEditModal,
            showProfileShareModal: showProfileShareModal,
            showRequestReviewModal: showRequestReviewModal,
            showAddFriendsModal: showAddFriendsModal,
            showMessageFriendModal: showMessageFriendModal,
            showFriendRequestModal: showFriendRequestModal,
            showFriendManualAddModal: showFriendManualAddModal,
            showProfileEditTrailersModal: showProfileEditTrailersModal,
            showProfileEditTrucksModal: showProfileEditTrucksModal,
            showAddExperienceModal: showAddExperienceModal,
            showEditExperienceModal: showEditExperienceModal,
            showWelcomeModal: showWelcomeModal
        };

        function showProfileEditModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-edit.html';
            controller = 'ProfileEditCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showProfileShareModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-share.html';
            controller = 'ProfileShareCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showRequestReviewModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-request.html';
            controller = 'ProfileRequestReviewCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showAddFriendsModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-friends-add.html';
            controller = 'AddFriendsCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showMessageFriendModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-friends-message.html';
            controller = 'ProfileFriendMessageCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showFriendRequestModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-friend-requests.html';
            controller = 'ProfileFriendRequestCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showFriendManualAddModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-friends-manual-add.html';
            controller = 'ManualFriendsAddCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showProfileEditTrailersModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-edit-trailers.html';
            controller = 'ProfileEditTrailersCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showProfileEditTrucksModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-edit-trucks.html';
            controller = 'ProfileEditTrucksCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params);
        }

        function showAddExperienceModal (parameters) {
            controller = 'ProfileAddExperienceCtrl as vm';
            templateUrl = 'modules/account/child_modules/profile/templates/profile-experience-edit.html';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params);
        }

        function showEditExperienceModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-experience-edit.html';
            controller = 'ProfileEditExperienceCtrl as vm';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params);
        }

        function showWelcomeModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-welcome.html';
            controller = 'ProfileWelcomeCtrl as vm';
            params = parameters || {};
            return modalService
                .show(templateUrl, controller, params);
        }
    }
})();
