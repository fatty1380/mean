(function () {
    'use strict';

    function reroute($rootScope, $state, Auth, $log) {

        var isRedirectInProgress = false;
        var redirectString;

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

            if (isRedirectInProgress && !event.defaultPrevented) {
                $log.warn('[CoreConfig] stateChangeStart already in progress [%s]. Stopping redirect to "%s"', redirectString, toState.name);
                return;
            }

            $log.info('[CoreConfig] Leaving state: %s "%s" %o Entering state: %s "%s" %o', fromState.name, fromState.url, fromState, toState.name, toState.url, toState, event);
            //$log.info('[CoreConfig] Entering state: %o. %o', toState.name, toState);

            redirectString = fromState.name + ' --> ' + toState.name;

            if (toState.authenticate && !Auth.isLoggedIn()) {
                isRedirectInProgress = true;
                $log.error('State \'%s\' requires authentication but no user is signed in', toState.name);
                event.preventDefault();
                $state.go('intro');
                return;
            }


            else if (Auth.user && /^(intro|home)$/gi.test(toState.name)) {
                switch (Auth.user.type) {
                    case 'driver':
                        isRedirectInProgress = true;
                        $log.info('[HomeController] Re-Routing to driver\'s profile page');
                        event.preventDefault();
                        $state.go('drivers.home');
                        return;
                    case 'owner':
                        isRedirectInProgress = true;
                        $log.info('[HomeController] Re-Routing to the user\'s company home');
                        event.preventDefault();
                        $state.go('companies.home');
                        return;
                    default:
                        $log.warn('[HomeController] Unknown User Type');
                        if (Auth.isAdmin()) {
                            $log.warn('[HomeController] Admin User - routing to user list');
                            $state.go('users.list');
                            return;
                        }
                }
            }
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            isRedirectInProgress = false;

            $log.info('[CoreConfig] $stateChangeSuccess completed: From state: %s "%s" %o To state: %s "%s" %o', fromState.name, fromState.url, fromState, toState.name, toState.url, toState, event);
        });

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            $log.error('State Change error from %s to %s', fromState.name, toState.name, error);

            $log.warn('Error Status: %d in transition', error.status);
            if (error.status === 403) {
                event.preventDefault();
                $log.warn('User does not have access to %s', toState.name);
                $state.go('authentication');
                return;
            }

            if (fromState && fromState.name) {
                event.preventDefault();
                $log.warn('Rerouting back to source state');
                $state.go(fromState.name, {error: error});
            } else {
                event.preventDefault();
                $log.warn('Unknown next step');
            }
        });
    }

    function scrollTopChange($rootScope, $document, $log) {
        $rootScope.$on('$stateChangeSuccess', function () {
            $document.scrollTo(-50, 0);
        });
    }

    scrollTopChange.$inject = ['$rootScope', '$document', '$log'];
    reroute.$inject = ['$rootScope', '$state', 'Authentication', '$log'];

    // Setting up route
    angular
        .module('core')
        .run(reroute)
        .run(scrollTopChange);
})();

