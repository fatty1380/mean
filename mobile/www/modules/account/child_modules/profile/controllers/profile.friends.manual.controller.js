(function() {
    'use strict';

    angular
        .module('account')
        .controller('ManualFriendsAddCtrl', ManualFriendsAddCtrl);

    ManualFriendsAddCtrl.$inject = ['$scope', '$state', 'contactsService', '$ionicScrollDelegate'];

    function ManualFriendsAddCtrl($scope, $state, contactsService, $ionicScrollDelegate) {
        var vm = this;

        vm.closeModal = closeModal;
        vm.addFriend = addFriend;

        function addFriend() {
            var contact = {
                checked: true,
                displayName: vm.displayName,
                phones: [{value: vm.phone, type: 'main' }],
                emails: [{value: vm.email }]
            };

            closeModal(contact);
        }

        function closeModal(contact) {
            $scope.closeModal(contact);
        }
    }

})();
