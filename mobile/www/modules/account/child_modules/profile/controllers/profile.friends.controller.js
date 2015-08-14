(function() {
    'use strict';

    angular
        .module('account')
        .controller('FriendsCtrl', FriendsCtrl);

    FriendsCtrl.$inject = ['friendsService','$ionicScrollDelegate'];

    function FriendsCtrl(friendsService, $ionicScrollDelegate) {
        var vm = this;

        vm.contacts = friendsService.allList;
        vm.friends = friendsService.friends;
        vm.users = friendsService.users;
        vm.searchText = "";

        vm.searchHandler = function () {
            console.log(" ");
            console.log("searchHandler()");
            console.log(vm.searchText.length);
            $ionicScrollDelegate.$getByHandle('main-content-scroll').scrollTop();
        };
    }

})();
