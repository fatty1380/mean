(function () {
    'use strict';

    function registerRootScopeEventListeners($rootScope, $state, Auth, $log, $document, $location, $window) {

        /** SECTION: State Change Listeners */
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
                        $log.info('[CoreConfig] Re-Routing to driver\'s profile page');
                        event.preventDefault();
                        $state.go('users.view');
                        return;
                    case 'owner':
                        isRedirectInProgress = true;
                        $log.info('[CoreConfig] Re-Routing to the user\'s company home');
                        event.preventDefault();
                        $state.go('companies.home');
                        return;
                    default:
                        $log.warn('[CoreConfig] Unknown User Type');
                        if (Auth.isAdmin()) {
                            $log.warn('[CoreConfig] Admin User - routing to user list');
                            $state.go('users.list');
                            return;
                        }
                }
            }
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if(!!fromState && !!fromState.name) {
                $state.gotoPrevious = function () {
                    $state.go(fromState, fromParams);
                };
            } else {
                $state.gotoPrevious = null;
            }
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            isRedirectInProgress = false;

            $log.info('[CoreConfig] $stateChangeSuccess completed: From state: %s "%s" %o To state: %s "%s" %o', fromState.name, fromState.url, fromState, toState.name, toState.url, toState, event);
        });

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            $log.error('State Change error from %s to %s', fromState.name, toState.name, error);

            $log.warn('Error Status: %d in transition', error.status || error);
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

        /** Scroll Top Change
         * This will scroll the window to the top of the frame, assuming no hash is specified
         */
        $rootScope.$on('$stateChangeSuccess', function () {
            if(!$location.hash()) {
                $document.scrollTo(-50, 0);
            }
        });

        /** GoogleAnalytics Router Engine
         * This reports 'Proper' analytics on page views, state changes and the like
         * by linking to stateChangeSuccess, rather than page reload.
         */
        $rootScope.$on('$stateChangeSuccess', function (event) {
            if (!$window.ga) {
                return;
            }

            $window.ga('send', 'pageview', {page: $location.path()});
        });
    }

    registerRootScopeEventListeners.$inject = ['$rootScope', '$state', 'Authentication', '$log', '$document', '$location', '$window'];

    // Setting up route
    angular
        .module('core')
        .run(registerRootScopeEventListeners);
})();

