(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileRequestReviewCtrl', ProfileRequestReviewCtrl);

    ProfileRequestReviewCtrl.$inject = ['$scope', 'userService'];

    function ProfileRequestReviewCtrl($scope, userService) {
        var vm = this;
        vm.profileData = userService.profileData;
        vm.contact = {};

        vm.cancel = function(){
            $scope.closeModal(null);
        }
    }
})();
