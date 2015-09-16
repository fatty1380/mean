(function() {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['$q', 'profileModalsService', '$scope', 'contactsService', 'utilsService', '$filter', 'parameters', '$http', 'settings', '$ionicLoading'];

    function AddFriendsCtrl($q, profileModalsService, $scope, contactsService, utilsService, $filter, parameters, $http, settings, $ionicLoading) {
        var vm = this;

        vm.searchText = "";
        vm.contacts = []; 

        vm.cancel = cancel;
        vm.showAddFriendsModal = addFriends;
        vm.showFriendManualAddModal = showFriendManualAddModal;
        
        initialize(parameters);
        
        ///////////////////////////////////////////////////////
        
        function initialize(parameters) {
            $q.when(parameters,
                function success(contacts) {
                    console.error('marging %d Contacts', contacts.length);
                    
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
            var filter = $filter('getChecked'),
                friends = filter(vm.contacts),
                deferred = $q.defer(),
                promise = deferred.promise,
                requestSentStatuses = [],
                successfullySent, messageTemplate;

            //TODO: remove requestSentStatuses array when there will be a possibility to send an array of users
            //TODO: and show the message in the success callback

            for(var i = 0; i < friends.length; i++){
                var postData = {contactInfo: friends[i], text: 'hello there!'},
                    serializedData = utilsService.serialize(postData);

                $http
                    .post(settings.requests, serializedData)
                    .then(function () {
                        requestSentStatuses.push(true);
                        if(i = friends.length){
                            successfullySent = requestSentStatuses.indexOf(false) < 0;
                            deferred.resolve(successfullySent);
                        }
                    }, function (err) {
                        requestSentStatuses.push(false);
                    });
            }

            promise.then(function (response) {
                if(response){
                    messageTemplate = 'Invitations are successfully sent';
                    $ionicLoading.show({template: messageTemplate, duration: '1500'});
                }
            });

        }

        function cancel() {
            $scope.closeModal(null);
        }

    }

})();
