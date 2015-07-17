(function() {
    'use strict';

    angular
        .module('signup.license', [])
        .controller('licenseCtrl', function ($scope, $location) {

            $scope.continue = function() {
                console.log('continue truck');
                $location.path("signup/trucks");
            }
        });
})();
