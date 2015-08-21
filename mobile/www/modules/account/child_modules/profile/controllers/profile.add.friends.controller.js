(function() {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['$scope', 'friendsService','$ionicScrollDelegate'];

    function AddFriendsCtrl($scope, friendsService, $ionicScrollDelegate) {
        var vm = this;

        vm.contacts = friendsService.allList;
        vm.friends = friendsService.friends;
        vm.users = friendsService.users;
        vm.searchText = "";

        vm.cancel = function () {
            $scope.closeModal(null);
        }

    }

})();
