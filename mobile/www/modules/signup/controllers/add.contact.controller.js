(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['$state', '$q', 'registerService', '$ionicPopup', '$http', 'settings', 'utilsService', '$ionicLoading', 'contactsService', '$filter'];

    function AddContactFriendsCtrl($state, $q, registerService, $ionicPopup, $http, settings, utilsService, $ionicLoading, contactsService, $filter) {
        var vm = this;

        $ionicLoading.hide();

        vm.contacts = contactsService.getContacts();

        vm.sendInvitations = sendInvitations;
        vm.skipToProfile = skipToProfile;

        function skipToProfile() {
            registerService.updateUser(registerService.userData)
                .then(function (response) {
                    if (response.success) {
                        $state.go('account.profile');
                    }
                }, function (err) {
                    $state.go('account.profile');
                });
        }

        function sendInvitations() {
            var filter = $filter('getChecked'),
                selectedContacts = filter(vm.contacts, {clearChecked: false});

            if(!selectedContacts.length){
                $ionicPopup.alert({
                    title: 'Please, select contacts',
                    template: 'You have to select contacts you want to invite.'
                });
                return;
            }

            var names = [];

            for (var i = 0; i < selectedContacts.length; i++) {
                names.push(selectedContacts[i].displayName);
            }

            var template = names.join(','),
                confirm = $ionicPopup.confirm({
                    title: 'Invite selected contacts?',
                    template: template
                });

            if (selectedContacts.length) {
                confirm.then(function (res) {
                    if (res) {
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

                            var postData = { contactInfo: selectedContacts[i], text: 'hello there!' },
                                serializedData = utilsService.serialize(postData);

                            var r = $http
                                .post(settings.requests, serializedData)
                                .then(function (resp) {
                                    console.warn(' resp --->>>', resp);
                                    $ionicLoading.show({ template: 'Invitations are successfully sent', duration: '1500' });
                                }, function (err) {
                                    console.warn(' err --->>>', err);
                                });
                                
                            reqs.push(r);
                        }
                        
                        return $q.all(reqs);
                        
                    } else {
                        console.log('friends are not invited');
                    }
                })
                .then(function (sentRequests) {
                    console.log('Sent ' + sentRequests.length + ' requests');
                    registerService.updateUser(registerService.userData
                        .then(function (response) {
                            if (response.success) {
                                $state.go('account.profile');
                            }
                        }));
                })
                .catch(function (err) {
                    console.error('Unable to invite friends:', err);
                    $state.go('account.profile');
                });
            }
        }

    }
})();
