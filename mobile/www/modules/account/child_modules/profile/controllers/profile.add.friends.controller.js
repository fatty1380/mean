(function() {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['$scope', 'friendsService', 'contactsService', '$ionicScrollDelegate', 'parameters'];

    function AddFriendsCtrl($scope, friendsService, contactsService, $ionicScrollDelegate, parameters) {
        var vm = this;

        vm.contacts = parameters;
        vm.friends = friendsService.friends;
        vm.users = friendsService.users;
        vm.searchText = "";

        vm.inviteContact = inviteContact;
        vm.cancel = cancel;

        function inviteContact(contact, $event) {
            console.warn(' $event --->>>', $event);
            var element = $event.toElement,
                classList = element.classList;

            if(!classList.contains('selected')){
                $event.toElement.classList.add('selected');
                $event.toElement.textContent = 'Selected';
            }else{
                $event.toElement.classList.remove('selected');
                $event.toElement.textContent = 'Invite';
            }
        }

        function cancel() {
            $scope.closeModal(null);
        }

    }

})();
