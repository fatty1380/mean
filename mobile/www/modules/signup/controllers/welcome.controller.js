(function () {
    'use strict';

    angular
        .module('signup')
        .controller('WelcomeCtrl', WelcomeCtrl);

    WelcomeCtrl.$inject = ['$state', 'registerService'];

    function WelcomeCtrl($state, registerService) {
        var vm = this;

        vm.welcomeText = 'Thanks for sharing Outset with your friends on the road. As your network grows so will your reputation! This is placeholder text and should be stored in a config variable for later changes';

        vm.continueToProfile = continueToProfile;

        function continueToProfile() {
            registerService.updateUser(registerService.getDataProps())
                .then(function (response) {
                    if(response.success) {
                        $state.go("account.profile");
                    }
                });
        }
    }
})();
