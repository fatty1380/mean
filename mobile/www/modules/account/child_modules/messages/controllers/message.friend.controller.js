(function () {
    'use strict';
    
    /**
     * Message Modal : selectChatRecipient
     * Invoked to select a user from a list of user's friends.
     * @returns the selected friend
     */

    angular
        .module('messages')
        .controller('MessageFriendCtrl', MessageFriendCtrl);

    MessageFriendCtrl.$inject = ['$scope', 'parameters', 'userService'];
    function MessageFriendCtrl ($scope, parameters, userService) {
        var vm  = this;
        
        vm.friends = parameters.friends;
        vm.messageFriend = messageFriend;
        vm.getAvatar = getAvatar;

        function messageFriend (friend) {
            $scope.closeModal(friend);
        }

        function getAvatar(friend) {
            return userService.getAvatar(friend);
        }

    }
})();
