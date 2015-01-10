(function() {
    'use strict';

    function PrivacyModalDirective() {
        return {
            transclude: true,
            templateUrl: 'modules/core/views/privacy.client.directive.html',
            restrict: 'EA',
            scope: {
                title: '@?',
                terms: '@?',
                acceptFn: '&?'
            },
            controller: 'PrivacyModalController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    function PrivacyModalController($modal, $log) {
        var vm = this;

        vm.isOpen = false;

        vm.showModal = function() {
            var modalInstance = $modal.open({
                templateUrl: 'privacyModal.html',
                size: 'xl',
                backdropClass: 'darken',
                windowClass: 'tos',
                controller: 'PrivacyController',
                controllerAs: 'vm',
                resolve: {
                    vm : function() {
                        return vm;
                    }
                }
            });

            modalInstance.result.then(function(result) {
                $log.info('Modal result %o', result);
                if(vm.acceptFn) {
                    vm.acceptFn(result);
                }
                vm.isOpen = false;
            }, function(result) {
                $log.info('Modal dismissed at: ' + new Date());
                vm.isOpen = false;
            });

            modalInstance.opened.then(function(args) {
                vm.isOpen = true;
            });
        };
    }

    function PrivacyController(vm, $log) {
        $log.debug('PrivacyController: Init with values: %o', vm);

        if (vm.privacyHTML) {
            $log.debug('DocHTML wins over DocTemplate');
        }
    }

    PrivacyController.$inject = ['vm', '$log'];
    PrivacyModalController.$inject = ['$modal', '$log'];

    angular.module('core')
        .directive('osPrivacy', PrivacyModalDirective)
        .controller('PrivacyModalController', PrivacyModalController)
        .controller('PrivacyController', PrivacyController);

})();


