(function () {
    'use strict';
    
    /**
     * Part of Signup Flow --> TODO: Replace with Add Friends Modal
     */

    angular
        .module('signup')
        .controller('AddFriendManuallyCtrl', AddFriendManuallyCtrl);

    AddFriendManuallyCtrl.$inject = ['$scope', '$state', 'contactsService', '$ionicPopup'];

    function AddFriendManuallyCtrl($scope, $state, contactsService, $ionicPopup) {
        var vm = this;

        vm.invite = invite;
        vm.cancel = cancel;
        vm.init = init;

        $scope.$on('$ionicView.enter', function () {
            init();
        });

        function init(newContact) {
            vm.contact = newContact || { type: 'manual' };
        }

        function invite() {
            return contactsService.addContact(vm.contact)
                .then(function () {
                    return $state.go('signup-friends-contacts');
                });
        }

        function cancel() {
            return $state.go('signup-friends-contacts');
        }

    }

})();
