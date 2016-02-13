(function () {
    'use strict';

    /**
     * Part of Signup Flow --> TODO: Replace with Add Friends Modal
     */

    angular
        .module('signup')
        .controller('AddFriendManuallyCtrl', AddFriendManuallyCtrl);

    AddFriendManuallyCtrl.$inject = ['$scope', '$state', 'contactsService', '$ionicPopup', '$cordovaGoogleAnalytics'];

    function AddFriendManuallyCtrl ($scope, $state, contactsService, $ionicPopup, $cordovaGoogleAnalytics) {
        var vm = this;

        vm.invite = invite;
        vm.cancel = cancel;
        vm.init = init;

        vm.registerForm = registerForm;

        $scope.$on('$ionicView.enter', function () {
            init();
        });

        function init (newContact) {
            vm.contact = newContact || { type: 'manual' };
        }

        function registerForm (form) {
            vm.contactForm = form;
        }

        function invite () {
            if (!!vm.contactForm) {
                vm.contactForm.$setSubmitted(true);
                vm.contactForm.validate();

                if (vm.contactForm.$invalid) {
                    vm.error = 'Please fix the errors above';
                    return;
                }
            }

            return contactsService
                .addContact(vm.contact)
                .then(function () {
                    $cordovaGoogleAnalytics.trackEvent('signup', 'addManualContact', 'success');
                    return $state.go('signup.friends-contacts');
                });
        }

        function cancel () {
            init();
            $cordovaGoogleAnalytics.trackEvent('signup', 'addManualContact', 'cancel');
            return $state.go('signup.friends-contacts');
        }

    }

})();
