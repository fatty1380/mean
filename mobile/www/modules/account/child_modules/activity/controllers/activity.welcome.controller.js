(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityWelcomeCtrl', ActivityWelcomeCtrl);

    ActivityWelcomeCtrl.$inject = [];

    function ActivityWelcomeCtrl() {
        var vm = this;
        vm.welcomeText = 'This is your Activity Feed where you can keep a personal log of your daily drive and see what your industry friends are up to when they post their daily log. Get started and Add your First Activity';
        vm.close = close;

        function close() {
            vm.closeModal();
        }
    }
})();
