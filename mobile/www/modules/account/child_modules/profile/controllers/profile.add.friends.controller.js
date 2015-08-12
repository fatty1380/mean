(function() {
    'use strict';

    function AddFriendsCtrl(friendsService, $ionicScrollDelegate) {
        var vm = this;

        vm.contacts = friendsService.allList;
        vm.friends = friendsService.friends;
        vm.searchText = "";

    }

    AddFriendsCtrl.$inject = ['friendsService','$ionicScrollDelegate'];

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

})();
