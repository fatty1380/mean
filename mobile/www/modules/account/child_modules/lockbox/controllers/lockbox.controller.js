(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$rootScope', 'documents', 'lockboxDocuments', 'lockboxModalsService'];

    function LockboxCtrl($rootScope, documents, lockboxDocuments,  lockboxModalsService) {
        var vm = this;

        vm.currentDoc = null;
        vm.documents = documents instanceof Array && documents.length ? documents : [] || [];

        vm.addDocsPopup = addDocs;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;

        $rootScope.$on("clear", function () {
            console.log('LockboxCtrl clear');
            vm.currentDoc = null;
            vm.documents = [];
        });

        /// Implementation
        function addDocs(docSku) {
            lockboxDocuments.addDocsPopup(docSku).then(
                function success(doc) {
                    console.log('Added new document with sku `%s` ', doc && doc.sku || doc);
                }
            )
        }

        function showEditModal(parameters) {
            lockboxModalsService.showEditModal(parameters)
                .then(
                    function (result) {
                        console.log(result);
                    },
                    function (err) {
                        console.log(err);
                    })
        }

        function showShareModal(parameters) {
            lockboxModalsService.showShareModal(parameters)
                .then(
                    function (result) {
                        console.log(result);
                    },
                    function (err) {
                        console.log(err);
                    })
        }
    }
})();
