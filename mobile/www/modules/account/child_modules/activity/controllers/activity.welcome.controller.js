(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityWelcomeCtrl', ActivityWelcomeCtrl);

    ActivityWelcomeCtrl.$inject = [];

    function ActivityWelcomeCtrl() {
        var vm = this;
        vm.welcomeText = 'The feed page is where you can interact with other drivers and keep up to date on what they are doing';
        vm.close = close;

        function close() {
            vm.closeModal();
        }
    }
})();
