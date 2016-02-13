(function () {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['$q', 'profileModalsService', '$scope', 'contactsService', 'utilsService', '$filter', 'parameters', '$http', 'settings', 'LoadingService', 'friendsService'];

    function AddFriendsCtrl ($q, profileModalsService, $scope, contactsService, utilsService, $filter, parameters, $http, settings, LoadingService, friendsService) {
        var vm = this;

        vm.searchText = '';
        vm.contacts = [];

        vm.showAddFriendsModal = addFriends;
        vm.showFriendManualAddModal = showFriendManualAddModal;
        vm.selected = getSelectedContacts;

        initialize(parameters);

        // /////////////////////////////////////////////////////

        function initialize (parameters) {
            $q.when(parameters,
                function success (contacts) {
                    logger.debug('Selecting from %d Contacts', contacts.length);

                    return contacts.forEach(function (contact) {
                        vm.contacts.push(contact);
                    });
                },
                function reject (err) {
                    logger.error('[ProfileAddFriends.initialize] Failed to Load Contacts', err);
                },
                function progress (status) {
                    logger.debug('Loading Contacts: %o', status);
                })
                .finally(function end () {
                    LoadingService.hide();
                });
        }

        function showFriendManualAddModal () {
            profileModalsService
                .showFriendManualAddModal()
                .then(function (contact) {
                    vm.contacts.unshift(contact);
                    contactsService.setContacts(vm.contacts);
                }, function (err) {
                    logger.error('[ProfileAddFriends.showManual] err --->>>', err);
                });
        }

        function getSelectedContacts () {
            return _.filter(vm.contacts, function (c) { return c.checked; });

        }

        function addFriends () {
            var filter = $filter('getChecked');
            var newInvites = filter(vm.contacts);

            // TODO: remove requestSentStatuses array when there will be a possibility to send an array of users
            // TODO: and show the message in the success callback

            LoadingService.showLoader('Sending Invitations');

            friendsService.sendFriendRequests(newInvites)
                .then(function (response) {
                    LoadingService.showSuccess('Invitations sent!');

                    vm.closeModal(response);
                })
                .catch(function fail (err) {
                    LoadingService.showFailure('Unable to Send Invitations<br>Please try again later');
                });

        }

    }

})();
