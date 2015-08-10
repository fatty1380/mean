(function () {
    'use strict';

    var lockboxShareService = function (lockboxDocuments, modalService) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;
        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
        vm.shareStep = 1;


        vm.close = function (modalName) {
            var self = this;
            modalService
                .close(modalName)
                .then(function () {
                    self.shareStep = 1;
                }
            );
        }
    };

    lockboxShareService.$inject = ['lockboxDocuments', 'modalService'];

    angular
        .module('lockbox')
        .service('lockboxShareService', lockboxShareService);

})();
