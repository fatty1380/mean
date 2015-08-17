(function() {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['friendsService','$ionicScrollDelegate'];

    function AddFriendsCtrl(friendsService, $ionicScrollDelegate) {
        var vm = this;

        vm.contacts = friendsService.allList;
        vm.friends = friendsService.friends;
        vm.searchText = "";

    }

})();
