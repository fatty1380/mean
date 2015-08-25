(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['$state', '$ionicLoading', 'contactsService', '$filter'];

    function AddContactFriendsCtrl($state, $ionicLoading, contacts,  contactsService, $filter) {
        var vm = this;

        vm.contacts = contactsService.contacts;

        console.log('RESOLVED CONTACTS', contacts);

        vm.sendInvitations = sendInvitations;

        function sendInvitations() {
            //$state.go('signup-welcome')
        }

        //function chooseContacts() {
        //    $ionicLoading.show({template: 'Loading contacts...'});
        //    var filter = $filter('getContacts');
        //
        //    vm.json = contactsService
        //        .find()
        //        .then(function (data) {
        //            console.log('DATDATA', data);
        //            vm.contacts = filter(data);
        //            console.log('FILTERED DATA', vm.contacts);
        //            $ionicLoading.hide();
        //        }, function (err) {
        //            console.log(err);
        //        });
        //}
        //chooseContacts();

    }
})();
