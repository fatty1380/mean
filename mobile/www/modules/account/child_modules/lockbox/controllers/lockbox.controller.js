(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$rootScope', 'documents', 'lockboxDocuments', 'lockboxModalsService'];

    function LockboxCtrl($rootScope, documents, lockboxDocuments,  lockboxModalsService) {
        var vm = this;

        vm.currentDoc = null;
        vm.documents = documents instanceof Array ? documents : [] || [];

        vm.addDocsPopup = addDocs;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;
        
        vm.newDoc = newDoc;
        vm.orderDocs = orderDocs;

        $rootScope.$on("clear", function () {
            console.log('LockboxCtrl clear');
            vm.currentDoc = null;
            vm.documents = [];
        });

        /// Implementation
        function addDocs(docSku) {
            var docCount = vm.documents.length;
            lockboxDocuments.addDocsPopup(docSku).then(
                function success(doc) {
                    if (!!doc) {
                        console.log('Added new document with sku `%s` ', doc && doc.sku || doc);
                    }
                    else {
                        console.log('No Doc added');
                    }
                    console.info('Lockbox documents went from ' + docCount + ' to ' + vm.documents.length);
                }
            )
        }
        
        /**
         * newDoc
         * Used to direct straight to adding a document via the camera or photo album.
         * Skips the 'new doc/order reports' sheet.
         */
        function newDoc(docSku) {
            debugger;
            return lockboxDocuments.newDocPopup(docSku);
        }
        
        /**
         * orderDocs
         * Used to direct straight to the ordering reports page.
         * Skips the 'new doc/order reports' sheet.
         */
        function orderDocs(doc) {
            return lockboxDocuments.orderReports(doc);
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
