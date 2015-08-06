(function () {
    'use strict';

    var modalService = function ($ionicModal, $rootScope, $injector, modalTemplates) {

        this.create = function (modalName) {
            var service = this,
                scope = $rootScope.$new(),
                modalObject = modalTemplates[modalName],
                modalService = modalObject && modalObject.service;

            //injecting modal logic and saving in the vm
            scope.vm = $injector.get(modalService);

            // saving this service in order to be able to call common methods
            scope.vm.modal = this;
            scope.vm.modalName = modalName;

            // removing modal on scope destroy to get rid of memory leeks
            scope.$on('$destroy', function() {
                scope.vm.modal[modalName].remove();
            });

            // creating modal and passing scope
            $ionicModal
                .fromTemplateUrl(modalObject.template, {
                    scope: scope
                })
                .then(function (modal) {
                    service[modalName] = modal;
                    service[modalName].show();
                });
        };

        this.show = function (modalName) {
            var modal = this[modalName];

            if(modal) return modal.show();
            else this.create(modalName);
        };

        this.close = function (modalName) {
            var modal = this[modalName];

            if(modal) return modal.hide();
        };

    };

    modalService.$inject = ['$ionicModal', '$rootScope', '$injector', 'modalTemplates'];

    angular
        .module(AppConfig.appModuleName)
        .service('modalService', modalService);

})();
