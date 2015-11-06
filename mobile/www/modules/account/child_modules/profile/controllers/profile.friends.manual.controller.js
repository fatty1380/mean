(function () {
    'use strict';

    angular
        .module('account')
        .controller('ManualFriendsAddCtrl', ManualFriendsAddCtrl);

    ManualFriendsAddCtrl.$inject = ['$scope', '$state', 'contactsService', '$ionicScrollDelegate', 'LoadingService'];

    function ManualFriendsAddCtrl($scope, $state, contactsService, $ionicScrollDelegate, LoadingService) {
        var vm = this;

        vm.contact = {};

        vm.addFriend = addFriend;

        initialize();

        /////////////////////////////
        
        function initialize() {
            LoadingService.hide();
        }

        function addFriend() {
            var contact = {
                checked: true,
                displayName: vm.contact.displayName,
                phone: vm.contact.phone,
                email: vm.contact.email
            };

            vm.closeModal(contact);
        }
    }

})();
