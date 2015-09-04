(function() {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['$q', 'profileModalsService', '$scope', 'contactsService', 'utilsService', '$filter', 'parameters', '$http', 'settings', '$ionicLoading'];

    function AddFriendsCtrl($q, profileModalsService, $scope, contactsService, utilsService, $filter, parameters, $http, settings, $ionicLoading) {
        var vm = this;

        vm.searchText = "";
        vm.contacts = parameters;

        vm.cancel = cancel;
        vm.addFriends = addFriends;
        vm.showFriendManualAddModal = showFriendManualAddModal;

        function showFriendManualAddModal() {
            profileModalsService
                .showFriendManualAddModal()
                .then(function (contact) {
                    console.warn(' contact --->>>', contact);
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
