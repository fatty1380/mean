(function() {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['$scope', 'friendsService', 'contactsService', '$filter', 'parameters'];

    function AddFriendsCtrl($scope, friendsService, contactsService, $filter, parameters) {
        var vm = this;

        vm.contacts = parameters;
        vm.friends = friendsService.friends;
        vm.users = friendsService.users;
        vm.searchText = "";

        vm.selectContact = selectContact;
        vm.cancel = cancel;
        vm.addFriends = addFriends;

        function selectContact(contact, $event) {

            contact.checked = !contact.checked;
            console.warn('invite contact --->>>', contact);

            var element = $event.toElement,
                classList = element.classList;

            if(!classList.contains('selected')){
                $event.toElement.classList.add('selected');
                $event.toElement.textContent = 'Selected';
            } else {
                $event.toElement.classList.remove('selected');
                $event.toElement.textContent = 'Invite';
            }
        }

        function addFriends() {
            var filter = $filter('getChecked'),
                friends = filter(vm.contacts);

            console.warn('invite friends --->>>', friends);

        }

        function cancel() {
            $scope.closeModal(null);
        }

    }

})();
