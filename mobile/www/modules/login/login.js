(function () {
    'use strict';

    var loginCtrl = function ($state, UserData) {
        console.log($state.current.name);
        console.log(UserData);
    };

    angular
        .module('login', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'modules/login/login.html',
                    controller: 'loginCtrl'
                }
            )
        }])
        .controller('loginCtrl', [
            '$state',
            'UserData',
            loginCtrl
        ]);

})();