(function() {
    'use strict';

    angular
        .module('account')
        .controller('FriendsCtrl', FriendsCtrl);

    FriendsCtrl.$inject = ['$state', 'friendsService', 'contactsService',  'profileModalsService', '$ionicScrollDelegate'];

    function FriendsCtrl($state, friendsService, contactsService, profileModalsService, $ionicScrollDelegate) {
        var vm = this;

        vm.contacts = friendsService.allList;
        vm.friends = friendsService.friends;
        vm.users = friendsService.users;
        vm.searchText = "";

        vm.addManually = addManually;
        vm.addFriends = addFriends;
        vm.getOutsetUsers = getOutsetUsers;

        //friendsService.createRequest({to: '55a8c832f58ef0900b7ca14c', text: 'ewq'});
        //friendsService.loadRequest('55a8c832f58ef0900b7ca14c').then(function (resp) {
        //    console.warn(' resp --->>>', resp);
        //})
        //friendsService.updateRequest('55e0850a33d5b9453d6e6af3', {status: 'accepted'}).then(function (resp) {
        //    console.warn(' resp --->>>', resp);
        //});

        function addFriends() {
            var contacts = contactsService.getContacts();

            if(!contacts.length){
                contactsService
                    .retrieveContacts()
                    .then(function (resp) {

                        console.warn('contacts profile resp --->>>', resp);

                        contacts = contactsService.getContacts();
                        showAddFriendsModal(contacts);
                    });
            }else{
                showAddFriendsModal(contacts);
            }
        }

        function showAddFriendsModal(contacts) {
            profileModalsService
                .showAddFriendsModal(contacts)
                .then(function (resp) {
                    console.warn('resp --->>>', resp);
                }, function (err) {
                    console.warn('err --->>>', err);
                });
        }

        function addManually() {
            $state.go('account.profile.friends.manual')
        }

        function getOutsetUsers() {

        }

        vm.searchHandler = function () {
            console.log(" ");
            console.log("searchHandler()");
            console.log(vm.searchText.length);
            $ionicScrollDelegate.$getByHandle('main-content-scroll').scrollTop();

        };
    }

})();
