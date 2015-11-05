(function() {
    'use strict';

    /**
     * Profile : Friend Request Controller
     * HTML: ./modules/account/child_modules/profile/templates/profile-friend-requests.html
     * Modal: profileModalService.showFriendRequestModal
     * Parameters: Array of request IDs
     */
    angular
        .module('account')
        .controller('ProfileFriendRequestCtrl', ProfileFriendRequestCtrl);

    ProfileFriendRequestCtrl.$inject = ['$scope', 'friendsService', 'userService', 'parameters', 'registerService', 'updateService'];

    function ProfileFriendRequestCtrl($scope, friendsService, userService,  parameters, registerService, updateService) {
        var vm = this;

        vm.requests = parameters || [];
        var initialFriendLength = userService.profileData.friends.length;
        vm.updatedProfle = false;

        vm.back = back;
        vm.handleRequest = handleRequest;
        vm.extendWithUserObject = extendWithUserObject;

        function handleRequest(request, action) {
            var data = { action: action},
                friends = userService.profileData.friends.indexOf(request.from) >= 0,
                index = vm.requests.indexOf(request);

            friendsService
                .updateRequest(request.id, data)
                .then(function () {
                    if(action === 'accept' && !friends) {
                        userService.profileData.friends.push(request.from);
                    }
                    updateService.resetUpdates('requests', vm.requests.length-1);
                    if(index >= 0) vm.requests.splice(index);
                });
        }

        function extendWithUserObject (request) {
            var index = vm.requests.indexOf(request);
            
            registerService
                .getProfileById(request.from)
                .then(function (response) {
                    if(response.success){
                        var userData = response.message.data;
                        userData.profileImageURL = userService.getAvatar(userData);

                        vm.requests[index].user =  userData;
                    }
                });

        }

        function back() {
            if(initialFriendLength !== userService.profileData.friends.length){
                friendsService.loadFriends(userService.profileData.id)
                    .then(function (friends) {
                        vm.closeModal(friends);
                    });
            }else{
                vm.closeModal();
            }
        }

    }

})();
