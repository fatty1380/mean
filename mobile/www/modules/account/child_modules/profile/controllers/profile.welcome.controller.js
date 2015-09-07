(function () {
    'use strict';

    angular
        .module('signup')
        .controller('ProfileWelcomeCtrl', ProfileWelcomeCtrl);

    ProfileWelcomeCtrl.$inject = ['$scope', 'registerService'];

    function ProfileWelcomeCtrl($scope, registerService) {
        var vm = this;

        vm.welcomeText = 'Thanks for sharing Outset with your friends on the road. As your network grows so will your reputation! This is placeholder text and should be stored in a config variable for later changes';

        vm.continueToProfile = continueToProfile;

        function continueToProfile () {
            $scope.closeModal();
        }

    }
})();
