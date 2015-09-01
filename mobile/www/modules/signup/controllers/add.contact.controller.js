(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['$state', '$ionicPopup', '$http', 'settings', 'utilsService', '$ionicLoading', 'contactsService', '$filter'];

    function AddContactFriendsCtrl($state, $ionicPopup, $http, settings, utilsService, $ionicLoading, contactsService, $filter) {
        var vm = this;

        $ionicLoading.hide();

        vm.contacts = contactsService.getContacts();

        vm.sendInvitations = sendInvitations;
        vm.skipToProfile = skipToProfile;

        function skipToProfile() {
            $state.go('account.profile');
        }

        function sendInvitations() {
            var filter = $filter('getChecked'),
                selectedContacts = filter(vm.contacts);

            var names = [];

            for(var i = 0; i < selectedContacts.length; i ++){
                names.push(selectedContacts[i].displayName);
            }

            var template = names.join(',');
            var confirm = $ionicPopup.confirm({
                title: 'Invite selected contacts?',
                template: template
            });

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
                                }, function (err) {
                                    console.warn(' err --->>>', err);
                                });

                    }
                    $state.go('signup-welcome');
                } else {
                    console.log('friends are not invited');
                }
            });
        }

    }
})();
