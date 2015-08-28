(function () {
    'use strict';

    angular
        .module('profile')
        .factory('profileModalsService', profileModalsService);

    profileModalsService.$inject = ['modalService'];

    function profileModalsService (modalService) {
        var templateUrl, controller, params;

        function showProfileEditModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-edit.html';
            controller = 'ProfileEditCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }

        function showProfileShareModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-share.html';
            controller = 'ProfileShareCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }

        function showRequestReviewModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-request.html';
            controller = 'ProfileRequestReviewCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }

        function showAddFriendsModal (parameters) {
            templateUrl = 'modules/account/child_modules/profile/templates/profile-friends-add.html';
            controller = 'AddFriendsCtrl as vm';
            params = parameters || {};

            return modalService
                .show(templateUrl, controller, params)
        }

        return {
            showProfileEditModal: showProfileEditModal,
            showProfileShareModal: showProfileShareModal,
            showRequestReviewModal: showRequestReviewModal,
            showAddFriendsModal: showAddFriendsModal
        };

    }

})();
