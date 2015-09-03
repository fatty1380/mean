(function() {
    'use strict';

    angular
        .module('account')
        .controller('FriendsCtrl', FriendsCtrl);

    FriendsCtrl.$inject = ['$state','$ionicLoading', '$timeout', 'outsetUsersService', 'utilsService', 'friends', 'friendsService', 'contactsService',  'profileModalsService', '$ionicScrollDelegate'];

    function FriendsCtrl($state, $ionicLoading, $timeout,  outsetUsersService, utilsService, friends, friendsService, contactsService, profileModalsService, $ionicScrollDelegate) {
        var vm = this;

        vm.friends = friends;
        vm.users = [];
        vm.searchText = "";

        vm.addManually = addManually;
        vm.addFriends = addFriends;
        vm.getOutsetUsers = getOutsetUsers;
        vm.messageFriend = messageFriend;
        vm.searchHandler = searchHandler;
        vm.showRequestsModal = showRequestsModal;
        vm.getRequests = getRequests;
        vm.addFriend = addFriend;
        vm.viewUser = viewUser;

        function showRequestsModal() {
            friendsService
                .getRequestsList()
                .then(function (requests) {
                    profileModalsService
                        .showFriendRequestModal(requests.data)
                        .then(function (updateFriends) {
                            if(updateFriends){
                                friendsService
                                    .retrieveFriends()
                                    .then(function (updatedFriends) {
                                        vm.friends = updatedFriends.data;
                                    });
                            }
                        }, function (err) {
                            console.warn('err --->>>', err);
                        });
                });
        }
        
        function viewUser(user, e) {
            console.log('Routing to User Profile Page for `%s`', user.displayName)
            $state.go('account.profile.user', { userId: user.id });
        }

        function addFriend(friend) {
            if(!friend) return;

            var requestData = {
                    to: friend.id,
                    text: 'Hi there! I want to add you to my friend list!'
                },
                serializedData = utilsService.serialize(requestData);

            friendsService
                .createRequest(serializedData)
                .then(function (createdRequestResp) {
                    if(createdRequestResp.status === 200){
                        var template = 'You have invited ' + friend.firstName + ' to be friends.';

                        $ionicLoading
                            .show({template:template, duration: 2000});

                    }
                });
        }

        function initFriends() {
            //var f = ['55b27b1893e595310272f1d0'];
            //
            //for (var i = 0; i < f.length; i++){
            //    var fo  =  {
            //        to: f[i],
            //        text: 'Hi!'
            //    };
            //
            //    friendsService
            //        .createRequest(fo)
            //        .then(function (createdRequestResp) {
            //            console.warn(' createdRequestResp --->>>', createdRequestResp);
            //
            //            var r = {id: createdRequestResp.data.id};
            //
            //            friendsService
            //                .loadRequest(r)
            //                .then(function (loadingRequest) {
            //                    console.warn(' loadingRequest --->>>', loadingRequest);
            //
            //                    //var s = { action: 'accept' };
            //
            //                    //friendsService
            //                    //    .updateRequest(createdRequestResp.data.id, s)
            //                    //    .then(function (updatingRequest) {
            //                    //        console.warn(' updatingRequest --->>>', updatingRequest);
            //                    //
            //                    //    })
            //                })
            //        });
            //}
        }

        function getRequests() {
            //return friendsService.getRequestsList()
            //    .then(function (requestList) {
            //        console.warn(' requestList --->>>', requestList);

                    //var s = { action: 'accept' };
                    //for(var i = 0; i < requestList.data.length; i++){
                    //
                    //    friendsService
                    //        .updateRequest(requestList.data[i].id, s)
                    //        .then(function (updatingRequest) {
                    //            console.warn(' updatingRequest --->>>', updatingRequest);
                    //
                    //        })
                    //}
                //})
        }

        function messageFriend(friend, e) {
            e.stopPropagation();
            
            /// TODO: Configure this properly
            $state.go('account.messages', {recipientId: friend.id});
            
            // profileModalsService
            //     .showMessageFriendModal(friend)
            //     .then(function (resp) {
            //         console.warn('resp --->>>', resp);
            //     }, function (err) {
            //         console.warn('err --->>>', err);
            //     });
        }

        function addFriends() {
            var contacts = contactsService.getContacts();

            if(!contacts.length){
                contactsService
                    .retrieveContacts()
                    .then(function (resp) {
                        console.warn('contacts profile resp --->>>', resp);
                        showAddFriendsModal(resp.data);
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

        function getOutsetUsers(query) {
            outsetUsersService
                .search(query)
                .then(function (response) {
                    vm.users = response.data;
                });
        }

        function searchHandler() {
            var length = vm.searchText.length;

            if(length >= 2){
                getOutsetUsers(vm.searchText);
            }

            $ionicScrollDelegate.$getByHandle('main-content-scroll').scrollTop();
        }
    }

})();
