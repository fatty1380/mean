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

    MessageFriendCtrl.$inject = ['$state', 'parameters', 'userService'];
    function MessageFriendCtrl ($state, parameters, userService) {
        var vm  = this;
        
        vm.friends = parameters.friends;
        vm.messageFriend = messageFriend;
        vm.getAvatar = getAvatar;
        vm.close = close;
        vm.gotoFriends = gotoFriends;

        function close () {
            vm.closeModal(null);
        }

        function messageFriend (friend) {
            vm.closeModal(friend);
        }

        function getAvatar(friend) {
            return userService.getAvatar(friend);
        }
        
        function gotoFriends() {
            $state.go('account.profile.friends');
            vm.closeModal(null);
        }

    }
})();
