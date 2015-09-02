(function() {
    'use strict';

    angular
        .module('account')
        .controller('AddFriendsCtrl', AddFriendsCtrl);

    AddFriendsCtrl.$inject = ['$scope', 'friendsService', 'utilsService', '$filter', 'parameters', '$http', 'settings', '$ionicLoading'];

    function AddFriendsCtrl($scope, friendsService, utilsService, $filter, parameters, $http, settings, $ionicLoading) {
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

            //for(var i = 0; i < friends.length; i++){
            //    if(friends[i].checked) delete friends[i].checked;
            //    if(friends[i].$$hashKey) delete friends[i].$$hashKey;
            //
            //    var postData = {contactInfo: friends[i], text: 'hello there!'},
            //        serializedData = utilsService.serialize(postData);
            //
            //    $http
            //        .post(settings.requests, serializedData)
            //        .then(function (resp) {
            //            console.warn(' resp --->>>', resp);
            //            $ionicLoading.show({template: 'Invitations are successfully sent', duration: '1500'});
            //        }, function (err) {
            //            console.warn(' err --->>>', err);
            //        });
            //
            //}


        }

        function cancel() {
            $scope.closeModal(null);
        }

    }

})();
