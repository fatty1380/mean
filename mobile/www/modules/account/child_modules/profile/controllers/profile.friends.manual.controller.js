(function () {
    'use strict';

    angular
        .module('account')
        .controller('ManualFriendsAddCtrl', ManualFriendsAddCtrl);

    ManualFriendsAddCtrl.$inject = ['$scope', '$state', 'contactsService', '$ionicScrollDelegate', 'LoadingService'];

    function ManualFriendsAddCtrl ($scope, $state, contactsService, $ionicScrollDelegate, LoadingService) {
        var vm = this;

        vm.contact = {};

        vm.addFriend = addFriend;
        vm.registerForm = registerForm;

        initialize();

        // ///////////////////////////

        function initialize (newContact) {
            LoadingService.hide();
            vm.contact = newContact || { type: 'manual' };
        }

        function registerForm (form) {
            debugger;
            vm.contactForm = form;
        }

        function addFriend () {
            debugger; // chck for vm.form
            if (!!vm.contactForm) {
                vm.contactForm.$setSubmitted(true);
                vm.contactForm.validate();

                if (vm.contactForm.$invalid) {
                    vm.error = 'Please fix the errors above';
                    return;
                }
            }

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
