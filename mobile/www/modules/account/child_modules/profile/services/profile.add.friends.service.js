(function() {
    'use strict';

    angular
        .module('account')
        .service('addFriendsService', addFriendsService);

    addFriendsService.$inject = ['friendsService','$ionicScrollDelegate', 'modalService'];

    function addFriendsService(friendsService, $ionicScrollDelegate, modalService) {
        //TODO: will be reworked/removed with modal service update
        var vm = this;

        vm.modal = modalService;
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
