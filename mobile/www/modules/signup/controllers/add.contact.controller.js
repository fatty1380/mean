(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['$state', 'registerService', '$ionicPopup', '$http', 'settings', 'utilsService', '$ionicLoading', 'contactsService', '$filter'];

    function AddContactFriendsCtrl($state,  registerService,  $ionicPopup, $http, settings, utilsService, $ionicLoading, contactsService, $filter) {
        var vm = this;

        $ionicLoading.hide();

        vm.contacts = contactsService.getContacts();

        vm.sendInvitations = sendInvitations;
        vm.skipToProfile = skipToProfile;

        function skipToProfile() {
            registerService.updateUser(registerService.getDataProps())
                .then(function (response) {
                    if(response.success) {
                        $state.go('account.profile.user');
                    }
                }, function (err) {
                    $state.go('account.profile.user');
                });
        }

        function sendInvitations() {
            var filter = $filter('getChecked'),
                selectedContacts = filter(vm.contacts);

            var names = [];

            for(var i = 0; i < selectedContacts.length; i ++){
                names.push(selectedContacts[i].displayName);
            }

            var template = names.join(','),
                confirm = $ionicPopup.confirm({
                    title: 'Invite selected contacts?',
                    template: template
                });

            if(selectedContacts.length){
                confirm.then(function(res) {
                    if(res) {
                        for(var i = 0; i < selectedContacts.length; i++){
                            console.warn('selectedContacts --->>>', selectedContacts);
                            var hasHashKey = selectedContacts[i].$$hashKey;
                            if(hasHashKey){
                                delete selectedContacts[i].$$hashKey;
                            }

                            var postData = {contactInfo: selectedContacts[i], text: 'hello there!'},
                                serializedData = utilsService.serialize(postData);

                            $http
                                .post(settings.requests, serializedData)
                                .then(function (resp) {
                                    console.warn(' resp --->>>', resp);
                                    $ionicLoading.show({template: 'Invitations are successfully sent', duration: '1500'});
                                }, function (err) {
                                    console.warn(' err --->>>', err);
                                });

                        }
                        registerService.updateUser(registerService.getDataProps())
                            .then(function (response) {
                                if(response.success) {
                                    $state.go('account.profile.user');
                                }
                            });
                    } else {
                        console.log('friends are not invited');
                    }
                });
            }
        }

    }
})();
