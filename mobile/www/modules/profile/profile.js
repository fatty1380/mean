(function () {
    'use strict';

    var profileCtrl = function ($scope) {
        $scope.edit = function () {
            console.log('edit profile')
        }
    };

    angular
        .module('profile', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('profile', {
                    url: '/profile',
                    templateUrl: 'modules/profile/profile.html',
                    controller: 'profileCtrl'
                }
            )
        }])
        .controller('profileCtrl', [
            '$scope',
            profileCtrl
        ]);

})();