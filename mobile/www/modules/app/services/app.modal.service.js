(function () {
    'use strict';

    var modalService = function ($ionicModal, modalTemplates, $rootScope, lockboxShareService) {

        this.show = function (modalName) {
            var service = this,
                scope = $rootScope.$new(),
                modalObject = modalTemplates[modalName];

            //todo: use injected service from modalObject
            scope.vm = lockboxShareService;

            $ionicModal
                .fromTemplateUrl(modalObject.template, {
                    scope: scope
                })
                .then(function (modal) {
                    service.modal = modal;
                    service.modal.show();
                });

        };

        this.close = function () {
            this.modal.hide();
        };

    };

    modalService.$inject = ['$ionicModal', 'modalTemplates', '$rootScope', 'lockboxShareService'];

    angular
        .module(AppConfig.appModuleName)
        .service('modalService', modalService);

})();
