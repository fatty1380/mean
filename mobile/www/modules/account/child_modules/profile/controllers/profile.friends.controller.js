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

        friendsService
            .getAllFriendsForLoggedUser()
            .then(function (resp) {
                console.log('All friends list SUCCESS --- > ', resp);
            }, function (err) {
                console.log('All friends list ERROR --- > ', err);
            });

        friendsService
            .getRequestsList()
            .then(function (resp) {
                console.log('All requests list SUCCESS --- > ', resp);
            }, function (err) {
                console.log('All requests list ERROR --- > ', err);
            });

        //friendsService
        //    .getAllFriendsForLoggedUser()
        //    .then(function (resp) {
        //        console.log('All friends list SUCCESS --- > ', resp);
        //    }, function (err) {
        //        console.log('All friends list ERROR --- > ', err);
        //    });
        //
        friendsService
            .createRequest('55a8c832f58ef0900b7ca14c')
            .then(function (resp) {
                console.log('Created friend request SUCCESS --- > ', resp);
            }, function (err) {
                console.log('Created friend request  ERROR --- > ', err);
            });

        //friendsService
        //    .getAllFriendsForLoggedUser()
        //    .then(function (resp) {
        //        console.log('All friends list SUCCESS --- > ', resp);
        //    }, function (err) {
        //        console.log('All friends list ERROR --- > ', err);
        //    });


        vm.searchHandler = function () {
            console.log(" ");
            console.log("searchHandler()");
            console.log(vm.searchText.length);
            $ionicScrollDelegate.$getByHandle('main-content-scroll').scrollTop();
        };
    }

})();
