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

    ProfileFriendRequestCtrl.$inject = ['$scope', 'friendsService', 'parameters', 'registerService'];

    function ProfileFriendRequestCtrl($scope, friendsService, parameters, registerService) {
        var vm = this;

        vm.requests = parameters || [];

        vm.cancel = cancel;
        vm.handleRequest = handleRequest;
        vm.getAvatar = getAvatar;
        vm.extendWithUserObject = extendWithUserObject;

        function handleRequest(request, action) {
            var data = { action: action},
                index = vm.requests.indexOf(request);

            friendsService
                .updateRequest(request.id, data)
                .then(function () {
                    if(index >= 0) vm.requests.splice(index);
                });
        }

        function extendWithUserObject (request) {
            var index = vm.requests.indexOf(request);
            
            registerService
                .getProfileById(request.from)
                .then(function (response) {
                    var userData = response.message.data;
                    userData.profileImageURL = getAvatar(userData);

                    vm.requests[index].user =  userData;
                });

        }

        function cancel() {
            $scope.closeModal(null);
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
