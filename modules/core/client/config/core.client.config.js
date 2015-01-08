(function() {
    'use strict';

    function reroute($rootScope, $state, Auth, $log) {

        var isRedirectInProgress = false;
        var redirectString;

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

            if(isRedirectInProgress && !event.defaultPrevented) {
                $log.warn('[CoreConfig] stateChangeStart already in progress [%s]. Stopping redirec to "%s"', redirectString, toState.name);
                return;
            }

            $log.debug('[CoreConfig] Leaving state: %s "%s" %o Entering state: %s "%s" %o', fromState.name, fromState.url, fromState, toState.name, toState.url, toState, event);
            //$log.debug('[CoreConfig] Entering state: %o. %o', toState.name, toState);

            redirectString = fromState.name + ' --> ' + toState.name;

            if (toState.authenticate && !Auth.isLoggedIn()) {
                isRedirectInProgress = true;
                $log.error('State \'%s\' requires authentication but no user is signed in', toState.name);
                event.preventDefault();
                $state.go('intro');
            }


            else if (Auth.user && /^(intro|home)$/gi.test(toState.name)) {
                switch (Auth.user.type) {
                    case 'driver':
                        isRedirectInProgress = true;
                        $log.debug('[HomeController] Re-Routing to driver\'s profile page');
                        event.preventDefault();
                        $state.go('drivers.home');
                        break;
                    case 'owner':
                        isRedirectInProgress = true;
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

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            isRedirectInProgress = false;

            $log.debug('[CoreConfig] $stateChangeSuccess completed: From state: %s "%s" %o To state: %s "%s" %o', fromState.name, fromState.url, fromState, toState.name, toState.url, toState, event);
        } );

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            $log.error('State Change error from %s to %s', fromState.name, toState.name, error);

            debugger;

            if(fromState && fromState.name) {
                event.preventDefault();
                $log.warn('Rerouting back to source state');
                $state.go(fromState.name, {error: error});
            } else {
                event.preventDefault();
                $log.warn('Unknown next step');
            }
        });
    }

    reroute.$inject = ['$rootScope', '$state', 'Authentication', '$log'];

    // Setting up route
    angular
        .module('core')
        .run(reroute);
})();

