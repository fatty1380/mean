(function () {
    'use strict';

    var modalService = function ($ionicModal, modalTemplates, $rootScope, lockboxShareService) {

        this.create = function (modalName) {
            var service = this,
                scope = $rootScope.$new(),
                modalObject = modalTemplates[modalName];

            //todo: use injected service from modalObject
            scope.vm = lockboxShareService;

            // saving this service in order to be able to call common methods
            scope.vm.modal = this;

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

            if(modal) modal.show();
            else this.create(modalName);
        };

        this.close = function (modalName) {
            var modal = this[modalName];

            if(modal) modal.hide();
        };

    };

    modalService.$inject = ['$ionicModal', 'modalTemplates', '$rootScope', 'lockboxShareService'];

    angular
        .module(AppConfig.appModuleName)
        .service('modalService', modalService);

})();
