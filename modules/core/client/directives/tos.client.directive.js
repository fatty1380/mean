(function () {
    'use strict';

    angular.module('core')
        .directive('tos', TOSModalDirective);

    function TOSModalDirective() {
        return {
            transclude: true,
            templateUrl: '/modules/core/views/tos.client.directive.html',
            restrict: 'EA',
            scope: {
                title: '@?',
                terms: '@?',
                acceptFn: '&?'
            },
            controller: TosModalController,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    TosModalController.$inject = ['$uibModal', '$log'];

    function TosModalController($uibModal, $log) {
        var vm = this;

        vm.isOpen = false;

        vm.showModal = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'tosModal.html',
                size: 'xl',
                backdropClass: 'darken',
                windowClass: 'tos',
                controller: TosController,
                controllerAs: 'vm',
                resolve: {
                    vm: function () {
                        return vm;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                $log.info('Modal result %o', result);
                if (vm.acceptFn) {
                    vm.acceptFn(result);
                }
                vm.isOpen = false;
            }, function (result) {
                $log.info('Modal dismissed at: ' + new Date());
                vm.isOpen = false;
            });

            modalInstance.opened.then(function (args) {
                vm.isOpen = true;
            });
        };
    }

    TosController.$inject = ['vm', '$log'];
    function TosController(vm, $log) {
        $log.debug('TosController: Init with values: %o', vm);

        if (vm.tosHTML) {
            $log.debug('DocHTML wins over DocTemplate');
        }
    }

})();


