(function () {
    'use strict';

    angular
        .module('account')
        .controller('FriendsCtrl', FriendsCtrl);
        
    /**
     * Friends Controller
     * ------------------
     * @resolve updates - get last updtaes from the updates service
     * @resolve profile - get the logged in (or visible) user's profile
     * @resolve friends - Gets a list of the `profile` user's friends
     * 
     * @inject Angular and Ionic Services ___________________________
     * @inject $rootScope
     * @injecct $state
     * @injecct $filter
     * @injecct $ionicLoading
     * @injecct $ionicScrollDelegate
     * 
     * @section Outset/Truckerline Services _________________________
     * @inject $osetUsersService
     * @inject utilsService
     * @inject friendsService
     * @inject contactsService
     * @inject profileModalsService
     * 
     */

    FriendsCtrl.$inject = ['updates', 'user', 'profile', 'friends',
        '$rootScope', '$state', '$filter', '$ionicLoading', '$ionicScrollDelegate',
       'userService', 'outsetUsersService', 'utilsService', 'friendsService', 'contactsService', 'profileModalsService'];

    function FriendsCtrl(updates, user, profile, friends,
        $rootScope, $state, $filter, $ionicLoading, $ionicScrollDelegate,
        userService, outsetUsersService, utilsService, friendsService, contactsService, profileModalsService) {

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
        vm.exitState = exitState;

        vm.initUser = initUser;

        initialize();
        
        ////////////////////////
        
        function initialize() {
            vm.canEdit = !profile;
            vm.profile = profile;
            vm.newRequests = updates.requests || 0;

            if (vm.canEdit) {
                vm.title = 'Friends';
                vm.yourFriendsTitle = 'Your Friends';
            }
            else {
                vm.title = vm.profile.displayName;
                vm.yourFriendsTitle = 'Friends';
            }

            $rootScope.$on('updates-available', function (event, updates) {
                vm.newRequests = updates.requests;
            });

        }

        function exitState() {
            return $state.go('^');
        }

        function showRequestsModal() {
            friendsService
                .getRequestsList()
                .then(function (requests) {
                    vm.newRequests = requests.data.length;
                    profileModalsService
                        .showFriendRequestModal(requests.data)
                        .then(function (updatedFriends) {
                            if (!!updatedFriends && updatedFriends.length) {
                                vm.friends = updatedFriends;
                            }
                        });
                });
        }

        function viewUser(user, e) {
            console.log('Routing to User Profile Page for `%s`', user.displayName)
            $state.go('account.profile', { userId: user.id });
        }

        function addFriend(friend, e) {
            e.stopPropagation();
            if (!friend) return;

            var requestData = {
                to: friend.id
            },
                serializedData = utilsService.serialize(requestData);

            friendsService
                .createRequest(serializedData)
                .then(function (createdRequestResp) {
                    if (createdRequestResp.status === 200) {
                        var template = 'You have invited ' + friend.firstName + ' to be friends.';

                        $ionicLoading
                            .show({ template: template, duration: 2000 });

                    }
                });
        }

        function messageFriend(friend, e) {
            e.stopPropagation();
            
            /// TODO: Configure this properly
            $state.go('account.messages', { recipientId: friend.id });
        }

        function showAddFriendsModal() {
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner><br>Loading Contacts ... <br><small>(this may take a moment)</small>', duration: 20000 });

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

                    $ionicLoading.hide();

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

            if (length >= 2) {
                getOutsetUsers(vm.searchText);
            } else {
                vm.users = [];
            }

            $ionicScrollDelegate.$getByHandle('main-content-scroll').scrollTop();
        }

        function initUser(userProfile) {
            userProfile.avatar = userService.getAvatar(userProfile);;
            
            // 
            userProfile.isFriend = _.contains(userProfile.friends, user.id)
            userProfile.isSelf = userProfile.id === user.id;
            
            userProfile.displayName = userProfile.isFriend ? vm.profile.displayName :
                userProfile.firstName + ' ' + (userProfile.lastName && userProfile.lastName.charAt(0));
        }
    }

})();
