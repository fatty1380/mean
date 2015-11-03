(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$scope', '$state', '$rootScope', 'securityService', 'documents', 'lockboxDocuments', 'lockboxModalsService', '$ionicPopup', '$ionicLoading', 'welcome'];

    function LockboxCtrl($scope, $state, $rootScope, securityService, documents, lockboxDocuments, lockboxModalsService, $ionicPopup, $ionicLoading, welcome) {


        var vm = this;

        vm.currentDoc = null;
        vm.documents = sortDocs(documents instanceof Array ? documents : [] || []);

        vm.addDocsPopup = addDocs;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;
        vm.refreshDocuments = refreshDocuments;

        vm.newDoc = newDoc;
        vm.orderDocs = orderDocs;

        vm.lockboxClear = false;

        $scope.$on("$ionicView.beforeEnter", function () {
            console.log('Reactivate Lockbox Controller');
            
            return lockboxDocuments.checkAccess({ redirect: true });
        });

        $rootScope.$on("clear", function () {
            console.log('LockboxCtrl clear');
            vm.currentDoc = null;
            vm.documents = [];
            lockboxDocuments.clear();
            securityService.logout();
        });

        function sortDocs(docs) {
            return _.sortBy(docs, function (d) { return !d.url; });
        }

        /// Implementation
        function addDocs(docSku) {
            var docCount = vm.documents.length;
            lockboxDocuments.addDocsPopup(docSku)
                .then(
                    function success(doc) {
                        if (!!doc) {
                            console.log('Added new document with sku `%s` ', doc && doc.sku || doc);
                            vm.documents = sortDocs(lockboxDocuments.updateDocumentList());
                        }
                        else {
                            console.log('No Doc added');
                        }
                        console.info('Lockbox documents went from ' + docCount + ' to ' + vm.documents.length);
                    })
                .catch(
                    function fail(rejection) {
                        if (rejection.error || _.isUndefined(rejection.error)) {
                            console.error('Failed to add Documents', rejection);
                        } else {
                            console.log('getNewAvatar Aborted %s', rejection.message || rejection)
                        }
                    })
                .finally(function () {
                    refreshDocuments();
                });
        }
        
        /**
         * newDoc
         * Used to direct straight to adding a document via the camera or photo album.
         * Skips the 'new doc/order reports' sheet.
         */
        function newDoc(docSku) {
            return lockboxDocuments.newDocPopup(docSku)
                .finally(function () {
                    refreshDocuments();
                });
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
            var params = {
                documents: vm.documents
            };
            lockboxModalsService.showEditModal(params)
                .then(
                    function (result) {
                        vm.documents = sortDocs(lockboxDocuments.updateDocumentList());
                        console.log(result);
                    },
                    function (err) {
                        console.log(err);
                    })
        }

        function showShareModal(parameters) {
            var params = {
                documents: vm.documents
            };
            lockboxModalsService.showShareModal(params)
                .then(
                    function (result) {
                        console.log(result);
                    },
                    function (err) {
                        console.log(err);
                    })
        }

        function refreshDocuments() {
            return lockboxDocuments.getDocuments(true)
                .finally(function () {
                    vm.documents = sortDocs(lockboxDocuments.updateDocumentList());
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
        }
    }
})();
