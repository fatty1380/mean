(function () {
    'use strict';

    angular
        .module('account')
        .controller('ManualFriendsAddCtrl', ManualFriendsAddCtrl);

    ManualFriendsAddCtrl.$inject = ['$scope', '$state', 'contactsService', '$ionicScrollDelegate', '$ionicLoading'];

    function ManualFriendsAddCtrl($scope, $state, contactsService, $ionicScrollDelegate, $ionicLoading) {
        var vm = this;

        vm.contact = {};

        vm.closeModal = closeModal;
        vm.addFriend = addFriend;

        initialize();

        /////////////////////////////
        
        function initialize() {
            $ionicLoading.hide();
        }

        function addFriend() {
            var contact = {
                checked: true,
                displayName: vm.contact.displayName,
                phones: [{ value: vm.contact.phone, type: 'main' }],
                emails: [{ value: vm.contact.email }]
            };

            closeModal(contact);
        }

        function closeModal(contact) {
            $scope.closeModal(contact);
        }
    }

})();
