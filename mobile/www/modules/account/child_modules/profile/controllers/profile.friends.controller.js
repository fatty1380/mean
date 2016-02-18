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
     * @injecct LoadingService
     * @injecct $ionicScrollDelegate
     *
     * @section Outset/TruckerLine Services _________________________
     * @inject $osetUsersService
     * @inject utilsService
     * @inject friendsService
     * @inject contactsService
     * @inject profileModalsService
     *
     */

    FriendsCtrl.$inject = ['updates', 'user', 'profile', 'friends',
        '$rootScope', '$state', '$filter', 'LoadingService', '$ionicScrollDelegate', '$timeout',
        'userService', 'outsetUsersService', 'utilsService', 'friendsService', 'contactsService', 'profileModalsService'];

    function FriendsCtrl (updates, user, profile, friends,
        $rootScope, $state, $filter, LoadingService, $ionicScrollDelegate, $timeout,
        userService, outsetUsersService, utilsService, friendsService, contactsService, profileModalsService) {

        var vm = this;

        vm.friends = friends;
        vm.users = [];
        vm.searchText = '';

        vm.addManually = addManually;
        vm.showAddFriendsModal = showAddFriendsModal;
        vm.getOutsetUsers = getOutsetUsers;
        vm.messageFriend = messageFriend;
        vm.searchHandler = searchHandler;
        vm.showRequestsModal = showRequestsModal;
        vm.addFriend = addFriend;
        vm.acceptFriend = acceptFriend;
        vm.viewUser = viewUser;
        vm.exitState = exitState;

        vm.initUser = initUser;

        initialize();

        // //////////////////////

        function initialize () {
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
                logger.debug('FriendsCtrl: %d New updates available: ', updates.requests);
                vm.newRequests = updates.requests;
            });

            LoadingService.hide();

        }

        function exitState () {
            return $state.go('^');
        }

        function showRequestsModal () {

            friendsService
                .getRequestsList()
                .then(function (requests) {
                    vm.newRequests = requests.data.length;

                    if (!vm.newRequests) {
                        LoadingService.show('no pending requests');
                        return;
                    }

                    profileModalsService
                        .showFriendRequestModal(requests.data)
                        .then(function (updatedFriends) {
                            if (!!updatedFriends && updatedFriends.length) {
                                vm.friends = updatedFriends;
                            }
                        });
                });
        }

        function viewUser (user, e) {
            logger.debug('Routing to User Profile Page for `%s`', user.displayName);
            $state.go('account.profile', { userId: user.id });
        }

        function addFriend (friend, e) {
            e.stopPropagation();
            if (!friend) return;

            var requestData = {
                to: friend.id
            };

            friendsService
                .createRequest(requestData)
                .then(function (createdRequestResp) {
                    if (createdRequestResp.status === 200) {
                        var template = 'You have invited ' + friend.firstName + ' to be friends.';

                        statii[friend.id] = 'sent';

                        LoadingService.showSuccess(template);
                    }
                });
        }

        function acceptFriend (friend, e) {
            e.stopPropagation();
            if (!friend) return;

            if (!friend.request) {
                logger.error('No Reqeust loaded for friend id %s', friend.id);
                return;
            }


            friendsService
                .updateRequest(friend.request.id, 'accept')
                .then(function (acceptRequestResp) {
                    statii[friend.id] = 'friends';
                    user.friends.push(friend.id);
                    var template = 'Added ' + (vm.profileData.handle || vm.profileData.firstName) + ' to your convoy';
                    LoadingService.showSuccess(template);
                });
        }

        function messageFriend (friend, e) {
            e.stopPropagation();

            // / TODO: Configure this properly
            $state.go('account.messages', { recipientId: friend.id });
        }

        function showAddFriendsModal () {
            LoadingService.showLoader('Loading Contacts<br><small>(this may take a moment)</small>');

            contactsService
                .find()
                .then(function (response) {
                    var filter = $filter('contactsFilter'),
                        contacts = filter(response);

                    contactsService.setContacts(contacts);

                    profileModalsService
                        .showAddFriendsModal(contacts)
                        .then(function (resp) {
                            logger.debug('[ProfileFriends.showAddFriends] resp --->>>', resp);
                        }, function (err) {
                            logger.error('[ProfileFriends.showAddFriends] err --->>>', err);
                        });
                })
                .catch(function reject (err) {
                    logger.error('[ProfileFriends.showAddFriends] Unable to resolve Contacts: ', err);

                    LoadingService.hide();

                    return addManually();
                });
        }

        function addManually () {
            return profileModalsService
                .showFriendManualAddModal()
                .then(function success (contact) {
                    logger.debug('Manual Add Friend Rusult: ', contact);

                    return friendsService.createRequest({
                        contactInfo: contact
                    });
                })
                .then(function sendInviteSuccess (result) {
                    logger.debug('Sent Invite', result.data);
                    LoadingService.showSuccess('Invitation Sent!');
                })
                .catch(function failure (err) {
                    LoadingService.showError('Unable to Send Invitation');
                    return null;
                });
        }

        var timer;

        var statii = {};

        function initFriendStatuses () {
            statii = {};
            statii[user.id] = 'me';
        }
        initFriendStatuses();


        function getOutsetUsers (query) {

            if (!!timer) {
                $timeout.cancel(timer);
            }

            return outsetUsersService
                .search(query)
                .then(function (response) {
                    vm.users = response.data;

                    timer = $timeout(function () {
                        _.each(vm.users, function (tlUser) {
                            if (statii[tlUser.id]) {
                                tlUser.friendStatus = statii[tlUser.id];
                                return;
                            }

                            friendsService
                                .getFriendStatus(tlUser.id)
                                .then(function (response) {
                                    statii[tlUser.id] = tlUser.friendStatus = response.data.status;
                                    tlUser.request = response.request;
                                });
                        });

                        timer = null;
                    }, 500);
                });
        }

        function searchHandler () {
            var length = vm.searchText.length;

            if (length >= 2) {
                getOutsetUsers(vm.searchText);
            } else {
                vm.users = [];
            }

            $ionicScrollDelegate.$getByHandle('main-content-scroll').scrollTop();
        }

        function initUser (userProfile) {
            userProfile.avatar = userService.getAvatar(userProfile);

            userProfile.isFriend = _.contains(user.friends, userProfile.id);
            userProfile.isSelf = userProfile.id === user.id;

            userProfile.displayName = userProfile.isFriend || userProfile.isSelf ?
                userProfile.displayName :
                userProfile.firstName + ' ' + (userProfile.lastName && userProfile.lastName.charAt(0));
        }
    }

})();
