(function () {
    'use strict';

    function FooterController($scope, auth, AppConfig) {
        var vm = this;
        
        vm.auth = auth;
        vm.isCollapsed = false;
        vm.year = (new Date()).getFullYear();
        vm.options = {};

        AppConfig.getOptions()
            .then(function (options) {
            vm.options = options;
        });

        vm.toggleCollapsibleMenu = function () {
            vm.isCollapsed = !vm.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            vm.isCollapsed = false;
        });
    }

    FooterController.$inject = ['$scope', 'Authentication', 'AppConfig'];

    angular
        .module('core')
        .controller('FooterController', FooterController);


})();
