(function () {
    'use strict';

    function HeaderController($scope, $state, $document, Authentication, Menus) {
        var vm = this;

        vm.state = $state;
        vm.auth = Authentication;
        vm.navbarClass = ''; //'navbar-inverse';
        vm.menu = Menus.getMenu('topbar');
        vm.cmenu = 'topbar';

        // Get the topbar menu
        var loadMenus = function() {
            if (Authentication.isAdmin() && vm.cmenu !== 'adminbar') {
                vm.cmenu = 'adminbar';
                vm.menu.length = 0;
                _.extend(vm.menu, Menus.getMenu('adminbar'));
                //vm.navbarClass = 'navbar-inverse';
            } else if(vm.cmenu !== 'topbar') {
                vm.cmenu = 'topbar';
                vm.menu.length = 0;

                _.extend(vm.menu,Menus.getMenu('topbar'));
                //vm.navbarClass = 'navbar-default';
            }
        };

        vm.stateLink = '';

        // Toggle the menu items
        vm.isCollapsed = false;
        vm.toggleCollapsibleMenu = function () {
            vm.isCollapsed = !vm.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function () {
            loadMenus();
            vm.isCollapsed = false;
            vm.hideHeader = !!($state.$current.data && $state.$current.data.hideHeader);
        });

        var handler = function() {
            //console.log('SCROLLING: %d', $document.scrollTop());
            vm.scroll = $document.scrollTop();
        };
        $document.on('scroll', $scope.$apply.bind($scope, handler));
        handler();

        loadMenus();
    }


    HeaderController.$inject = ['$scope', '$state', '$document', 'Authentication', 'Menus'];

    angular
        .module('core')
        .controller('HeaderController', HeaderController);

})();
