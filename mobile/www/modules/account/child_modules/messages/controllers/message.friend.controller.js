(function () {
    'use strict';

    angular
        .module('messages')
        .controller('MessageFriendCtrl', MessageFriendCtrl);

    MessageFriendCtrl.$inject = ['$scope', 'parameters'];

    function MessageFriendCtrl ($scope, parameters) {
        var vm  = this;
        
        vm.friends = parameters.friends;
        vm.messageFriend = messageFriend;
        vm.getAvatar = getAvatar;

        function messageFriend (friend) {
            $scope.closeModal(friend);
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
