/**
 * SettingsController
 * ------------------
 * The Settings Controller contains very little logic on its own, and serves
 * primarily as a gatekeeper to ensure that there is a user logged in, and that
 * that user is allowed to access the settings page.
 */

(function() {

    'use strict';

    function SettingsController($scope, $http, $stateParams, $location, $log, Users, Authentication) {

        this.user = Authentication.user;

        // If user is not signed in then redirect back home
        if (!this.user) $location.path('/');

        if (!!$stateParams.userId) {
            if ($stateParams.userId !== this.user._id && !this.user.isAdmin) {
                $log.warn('[SettingsController] Non-Admin tried to access another user\'s settings');
                $location.path('/');
            }
        }
    }

    SettingsController.$inject = ['$scope', '$http', '$stateParams', '$location', '$log', 'Users', 'Authentication'];

    angular
        .module('users')
        .controller('SettingsController', SettingsController);

})();
