(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['contacts', '$state', '$q', 'registerService', '$ionicPopup', '$http', 'settings', 'utilsService', 'LoadingService', 'contactsService', '$filter'];

    function AddContactFriendsCtrl(contacts, $state, $q, registerService, $ionicPopup, $http, settings, utilsService, LoadingService, contactsService, $filter) {
        var vm = this;

        debugger;
        vm.contacts = contacts || contactsService.getContacts();
        vm.contactsResolved = contactsService.isResolved();

        vm.skip = skip;
        vm.back = goBack;
        vm.loadContacts = loadContacts;
        vm.sendInvitations = sendInvitations;
        
        ///////////////////////////////////////////////////////////////////

        function skip() {
            $state.go('account.profile');
        }

        function goBack() {
            return $state.go('signup-friends');
        }

        function loadContacts() {
            return contactsService.resolveContacts()
                .then(function (resolvedContacts) {
                    debugger;
                    vm.contacts = resolvedContacts; // contactsService.getContacts();
                    vm.contactsResolved = contactsService.isResolved();
                })
                .finally(LoadingService.hide);
        }

        function sendInvitations() {
            var filter = $filter('getChecked');
            var selectedContacts = filter(vm.contacts, { clearChecked: false });

            if (!selectedContacts.length) {
                LoadingService.showFailure('Please select at least one contact to invite');
                return;
            }

            var confirm = $ionicPopup.confirm({
                title: 'TruckerLine Invites',
                template: 'Invite ' + selectedContacts.length + ' selected contacts?'
            });

            if (selectedContacts.length) {
                confirm
                    .then(function (res) {
                        if (res) {
                            LoadingService.showLoader('Sending Invitations');
                            // TODO: COMBINE w/ profile.add.friends.controller
                            //return friendsService.sendRequests(selectedContacts);

                            ///////
                            var reqs = [];
                            for (var i = 0; i < selectedContacts.length; i++) {
                                console.warn('selectedContacts --->>>', selectedContacts);
                                var hasHashKey = selectedContacts[i].$$hashKey;
                                if (hasHashKey) {
                                    delete selectedContacts[i].$$hashKey;
                                }

                                var postData = { contactInfo: selectedContacts[i], text: '' };

                                var r = $http
                                    .post(settings.requests, postData)
                                    .then(function (resp) {
                                        console.info('Send Request Success resp --->>>', resp);

                                    }, function (err) {
                                        console.error('Send request err --->>>', err);
                                    });

                                reqs.push(r);
                            }

                            return $q.all(reqs);

                        } else {
                            console.log('friends are not invited');
                            return $q.reject('cancel');
                        }
                    })
                    .then(function (sentRequests) {

                        if (!!sentRequests) {
                            console.log('Sent ' + sentRequests.length + ' requests');
                            LoadingService.showSuccess('Invitations Sent');
                        }

                        $state.go('account.profile');
                    })
                    .catch(function (err) {

                        if (/cancel/i.test(err)) {
                            console.log('user cancelled');
                            return;
                        }

                        console.error('Unable to invite friends:', err);
                        $ionicPopup.confirm({
                            title: 'Sorry',
                            template: 'Failed to send invites. Try again?'
                        }).then(function (res) {
                            if (res) {
                                return sendInvitations();
                            }
                            $state.go('account.profile');
                        });

                    });
            }
        }
    }
})();
