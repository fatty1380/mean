(function() {
    'use strict';

    function HomeController($scope, $location, $state, $anchorScroll, $modal, $log, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        // TODO: Move this to $stateChangeStart event (???)
        if ($scope.authentication.user) {
            switch ($scope.authentication.user.type) {
                case 'driver':
                    $log.debug('[HomeController] Re-Routing to driver\'s profile page');
                    $state.go('profile.me');
                    break;
                case 'owner':
                    $log.debug('[HomeController] Re-Routing to the user\'s companies');
                    $state.go('companies.me');
                    break;
                default:
                    if ($scope.authentication.user.roles.indexOf('admin') !== -1) {
                        $state.go('users.list');
                    }
                    $log.warn('Unknown User Type');
            }
        }

        $scope.showMain = true;
        $scope.showInfo = false;
        $scope.showSignup = false;

        $scope.gotoSignup = function() {
            $scope.showMain = false;
            $scope.showInfo = false;
            $scope.showSignup = true;

            // set the location.hash to the id of
            // the element you wish to scroll to.
            $location.hash('signup_type');

            // call $anchorScroll()
            $anchorScroll();
        };
    }

    HomeController.$inject = ['$scope', '$location', '$state', '$anchorScroll', '$modal', '$log', 'Authentication'];

    angular
        .module('core')
        .controller('HomeController', HomeController);
})();
