(function () {
    'use strict';

    angular
        .module('signup')
        .controller('ProfileWelcomeCtrl', ProfileWelcomeCtrl);

    ProfileWelcomeCtrl.$inject = ['$scope', 'registerService'];

    function ProfileWelcomeCtrl($scope, registerService) {
        var vm = this;

        vm.welcomeText = 'Welcome to your Truckerline Profile - This is where you will build and mange your Professional reputation. Be sure to fill out your experience and request reviews from shippers and co-workers. When you’re ready to apply for a job, or pick up a load make sure to share your profile with the interested party to put your best foot forward!';

        vm.continueToProfile = continueToProfile;

        function continueToProfile () {
            $scope.closeModal();
        }

    }
})();
