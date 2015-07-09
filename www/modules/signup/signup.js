(function () {
    'use strict';

    var signupCtrl = function ($state) {
        console.log($state.current.name);
    };

    angular
        .module('signup', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('signup', {
                    url: '/signup',
                    templateUrl: 'modules/signup/signupCore/signupCore.html',
                    controller: 'signupCtrl'
                }
            )
        }])
        .controller('signupCtrl', [
            '$state',
            signupCtrl
        ]);

})();