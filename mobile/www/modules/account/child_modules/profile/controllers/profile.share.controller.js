(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileShareCtrl', ProfileShareCtrl);

    ProfileShareCtrl.$inject = ['$scope', 'lockboxDocuments', 'userService'];

    function ProfileShareCtrl($scope, lockboxDocuments, userService) {
        var vm = this;

        vm.profileData = userService.profileData;
        vm.lockboxDocuments = lockboxDocuments.getDocuments();
        vm.shareStep = 1;

        vm.close = function () {
            $scope.closeModal(null)
        }
    }

})();
