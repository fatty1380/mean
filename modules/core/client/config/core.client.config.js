(function() {
    'use strict';

    function reroute($rootScope, $state, Auth, $log) {

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $log.debug('[CoreConfig] Entering state: %o. %o', toState.name, toState);

            if (Auth.user && toState.url === '/') {
                switch (Auth.user.type) {
                    case 'driver':
                        $log.debug('[HomeController] Re-Routing to driver\'s profile page');
                        event.preventDefault();
                        $state.go('drivers.me');
                        break;
                    case 'owner':
                        $log.debug('[HomeController] Re-Routing to the user\'s companies');
                        event.preventDefault();
                        $state.go('companies.me');
                        break;
                    default:
                        if (Auth.user.roles.indexOf('admin') !== -1) {
                            $state.go('users.list');
                        }
                        $log.warn('Unknown User Type');
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
