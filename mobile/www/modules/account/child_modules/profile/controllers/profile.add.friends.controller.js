(function () {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['$q', 'profileModalsService', '$scope', 'contactsService', 'utilsService', '$filter', 'parameters', '$http', 'settings', '$ionicLoading'];

    function AddFriendsCtrl($q, profileModalsService, $scope, contactsService, utilsService, $filter, parameters, $http, settings, $ionicLoading) {
        var vm = this;

        vm.searchText = "";
        vm.contacts = [];

        vm.showAddFriendsModal = addFriends;
        vm.showFriendManualAddModal = showFriendManualAddModal;

        initialize(parameters);
        
        ///////////////////////////////////////////////////////
        
        function initialize(parameters) {
            $q.when(parameters,
                function success(contacts) {
                    console.log('Selecting from %d Contacts', contacts.length);

                    return contacts.forEach(function (contact) {
                        vm.contacts.push(contact);
                    })
                },
                function reject(err) {
                    console.error('Failed to Load Contacts', err);
                },
                function progress(status) {
                    console.log('Loading Contacts: %o', status);
                })
                .finally(function end() {
                    $ionicLoading.hide();
                })
        }

        function showFriendManualAddModal() {
            profileModalsService
                .showFriendManualAddModal()
                .then(function (contact) {
                    vm.contacts.push(contact);
                    contactsService.setContacts(vm.contacts);
                }, function (err) {
                    console.warn('err --->>>', err);
                });
        }

        function addFriends() {
            var filter = $filter('getChecked');
            var newInvites = filter(vm.contacts);
            var deferred = $q.defer();
            var promise = deferred.promise;
            
            var requestSentStatuses = [];
            var successfullySent;
            var messageTemplate;

            //TODO: remove requestSentStatuses array when there will be a possibility to send an array of users
            //TODO: and show the message in the success callback
            
            // TODO: COMBINE w/ add.contact.controller
            //friendsService.sendRequests(newInvites);

            for (var i = 0; i < newInvites.length; i++) {
                var postData = { contactInfo: newInvites[i], text: '' };

                $http
                    .post(settings.requests, postData)
                    .then(function () {
                        requestSentStatuses.push(true);
                        if (i = newInvites.length) {
                            successfullySent = requestSentStatuses.indexOf(false) < 0;
                            deferred.resolve(successfullySent);
                        }
                    }, function (err) {
                        requestSentStatuses.push(false);
                    });
            }

            promise.then(function (response) {
                if (response || true) {
                    messageTemplate = 'Invitations have been successfully sent';
                    $ionicLoading.show({ template: messageTemplate, duration: '1500' });
                }
                
                vm.closeModal(response);
            });

        }

    }

})();
