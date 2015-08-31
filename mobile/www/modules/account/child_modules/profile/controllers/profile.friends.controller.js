(function() {
    'use strict';

    angular
        .module('account')
        .controller('FriendsCtrl', FriendsCtrl);

    FriendsCtrl.$inject = ['$state', 'friends', 'friendsService', 'contactsService',  'profileModalsService', '$ionicScrollDelegate'];

    function FriendsCtrl($state, friends, friendsService, contactsService, profileModalsService, $ionicScrollDelegate) {
        var vm = this;
        console.warn(' friends --->>>', friends);
        vm.friends = friends;
        vm.users = friendsService.users;
        vm.searchText = "";

        vm.addManually = addManually;
        vm.addFriends = addFriends;
        vm.getOutsetUsers = getOutsetUsers;
        vm.initFriends = initFriends;
        vm.getRequests = getRequests;
        vm.messageFriend = messageFriend;

        init();

        function init() {
            friendsService.setFriends(vm.friends);
        }

        function initFriends() {
            var f = ['55b27b1893e595310272f1d0'];

            for (var i = 0; i < f.length; i++){
                var fo  =  {
                    to: f[i],
                    text: 'Hi!'
                };

                friendsService
                    .createRequest(fo)
                    .then(function (createdRequestResp) {
                        console.warn(' createdRequestResp --->>>', createdRequestResp);

                        var r = {id: createdRequestResp.data.id};

                        friendsService
                            .loadRequest(r)
                            .then(function (loadingRequest) {
                                console.warn(' loadingRequest --->>>', loadingRequest);

                                //var s = { action: 'accept' };

                                //friendsService
                                //    .updateRequest(createdRequestResp.data.id, s)
                                //    .then(function (updatingRequest) {
                                //        console.warn(' updatingRequest --->>>', updatingRequest);
                                //
                                //    })
                            })
                    });
            }
        }

        function getRequests() {
            friendsService
                .getRequestsList()
                .then(function (requestList) {
                    console.warn(' requestList --->>>', requestList);

                    var s = { action: 'accept' };
                    for(var i = 0; i < requestList.data.length; i++){

                        friendsService
                            .updateRequest(requestList.data[i].id, s)
                            .then(function (updatingRequest) {
                                console.warn(' updatingRequest --->>>', updatingRequest);

                            })
                    }
                })
        }

        function messageFriend(friend) {
            profileModalsService
                .showMessageFriendModal(friend)
                .then(function (resp) {
                    console.warn('resp --->>>', resp);
                }, function (err) {
                    console.warn('err --->>>', err);
                });
        }

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
