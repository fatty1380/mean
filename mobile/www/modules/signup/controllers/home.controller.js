(function () {
    'use strict';

    var homeCtrl = function ($scope, $state) {
        console.log("!!!!!!");

        var vm = this;
        vm.activeSlide = 1;

      /*  $scope.model =  {
            activeSlide: 1
        };
*/
    };

    homeCtrl.$inject = ['$scope', '$state'];

    angular
        .module('signup')
        .controller('homeCtrl', homeCtrl );

})();
