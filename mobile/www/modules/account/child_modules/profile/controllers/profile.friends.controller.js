(function() {
    'use strict';

    angular
        .module('account')
        .controller('FriendsCtrl', FriendsCtrl);

    FriendsCtrl.$inject = ['$state', '$filter', '$ionicLoading', 'outsetUsersService', 'utilsService', 'friends', 'friendsService', 'contactsService',  'profileModalsService', '$ionicScrollDelegate'];

    function FriendsCtrl($state, $filter, $ionicLoading, outsetUsersService, utilsService, friends, friendsService, contactsService, profileModalsService, $ionicScrollDelegate) {
        var vm = this;

        vm.friends = friends;
        vm.users = [];
        vm.searchText = "";

        vm.addManually = addManually;
        vm.showAddFriendsModal = showAddFriendsModal;
        vm.getOutsetUsers = getOutsetUsers;
        vm.messageFriend = messageFriend;
        vm.searchHandler = searchHandler;
        vm.showRequestsModal = showRequestsModal;
        vm.addFriend = addFriend;
        vm.viewUser = viewUser;
        
        vm.getAvatar = getAvatar;

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

        function messageFriend(friend, e) {
            e.stopPropagation();
            
            /// TODO: Configure this properly
            $state.go('account.messages', {recipientId: friend.id});
        }

        function showAddFriendsModal() {
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>Loading Contacts ... ', duration: 20000 });

            contactsService
                .find()
                .then(function (response) {
                    var filter = $filter('contactsFilter'),
                        contacts = filter(response);

                    contactsService.setContacts(contacts);

                    profileModalsService
                        .showAddFriendsModal(contacts)
                        .then(function (resp) {
                            console.warn('resp --->>>', resp);
                        }, function (err) {
                            console.warn('err --->>>', err);
                        });
                })
                .catch(function reject(err) {
                    console.error('Unable to resolve Contacts: ', err);
                    
                    return addManually();
                });
        }

        function addManually() {
           return profileModalsService
                .showFriendManualAddModal()
                .then(function success(result) {
                    console.log('Manual Add Friend Rusult: ', result);
                    return result;
                })
                .catch(function failure(err) {
                    console.error('Add Friend Results failed', err);
                    return null;
                })
                .finally(function done() {
                    $ionicLoading.hide();
                })
        }

        function getOutsetUsers(query) {
           return outsetUsersService
                .search(query)
                .then(function (response) {
                    vm.users = response.data;
                });
        }

        function searchHandler() {
            var length = vm.searchText.length;

            if(length >= 2){
                getOutsetUsers(vm.searchText);
            }else{
                vm.users = [];
            }

            $ionicScrollDelegate.$getByHandle('main-content-scroll').scrollTop();
        }
        
        function getAvatar(friend) {
            var avatar = friend.profileImageURL || friend.props && friend.props.avatar;
            
            if (!avatar || avatar === 'modules/users/img/profile/default.png'
                || !!~avatar.indexOf('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4')) {
                return (friend.avatar = null);
            }
            
            friend.avatar = avatar;
            
            return avatar;
        }
    }

})();
