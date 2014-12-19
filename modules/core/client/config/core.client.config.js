(function() {
    'use strict';

    function reroute($rootScope, $state, Auth, $log) {

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $log.debug('[CoreConfig] Entering state: %o. %o', toState.name, toState);

            if (toState.authenticate && !Auth.isLoggedIn()) {
                $log.error('State \'%s\' requires authentication but no user is signed in', toState.name);
                event.preventDefault();
                $state.go('intro');
                return;
            }


            if (Auth.user && /^(intro|home)$/gi.test(toState.name)) {
                switch (Auth.user.type) {
                    case 'driver':
                        $log.debug('[HomeController] Re-Routing to driver\'s profile page');
                        event.preventDefault();
                        $state.go('drivers.home');
                        break;
                    case 'owner':
                        $log.debug('[HomeController] Re-Routing to the user\'s company home');
                        event.preventDefault();
                        $state.go('companies.home');
                        break;
                    default:
                        $log.warn('[HomeController] Unknown User Type');
                        if (Auth.isAdmin()) {
                            $log.warn('[HomeController] Admin User - routing to user list');
                            $state.go('users.list');
                        }
                }
            }
        });
    }

    reroute.$inject = ['$rootScope', '$state', 'Authentication', '$log'];

    // Setting up route
    angular
        .module('core')
        .run(reroute);
})();

