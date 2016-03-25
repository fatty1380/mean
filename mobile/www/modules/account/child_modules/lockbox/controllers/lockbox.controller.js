(function () {
    'use strict';

    angular
        .module('lockbox')
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$cordovaGoogleAnalytics', '$ionicHistory', '$rootScope', '$scope', '$state',
        'documents', 'LoadingService', 'lockboxDocuments', 'lockboxModalsService', 'securityService'];

    function LockboxCtrl ($cordovaGoogleAnalytics, $ionicHistory, $rootScope, $scope, $state,
        documents, LoadingService, lockboxDocuments, lockboxModalsService, securityService) {


        var vm = this;
        var watches = [];

        vm.currentDoc = null;
        vm.documents = documents instanceof Array ? documents : [] || [];
        sortDocs();

        vm.addDocsPopup = addDocs;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;
        vm.refreshDocuments = refreshDocuments;

        vm.newDoc = newDoc;
        vm.orderDocs = orderDocs;

        vm.lockboxClear = false;

        $scope.$on('$ionicView.beforeEnter', function () {
            if (documents === -1) {
                logger.debug('docs equals negative 1 - fail');
                return goBack();
            }

            logger.debug('Reactivate Lockbox Controller');

            init();
        });

        var clear = $rootScope.$on('clear', function () {
            $cordovaGoogleAnalytics.trackEvent('Lockbox', 'clear', null, vm.documents.length);
            logger.debug('LockboxCtrl clear');
            vm.currentDoc = null;
            vm.documents = [];
            lockboxDocuments.clear();
            securityService.logout();
        });

        watches.push(clear);

        function init () {
            $cordovaGoogleAnalytics.trackEvent('Lockbox', 'init', 'start', vm.documents.length);
        }

        function goBack () {
            documents = null;

            var backView = $ionicHistory.backView();
            if (_.isEmpty(backView) || _.isEmpty(backView.stateName)) {
                return $state.go('account.profile');
            }

            return $ionicHistory.goBack();
        }

        /**
         * sortDocs
         * --------
         * Sorts the vm.documents array _IN PLACE_ placing docs with
         * a URL ahead of those without one.
         */
        function sortDocs () {
            if (_.isArray(vm.documents)) {
                vm.documents.sort(function (a, b) {
                    return a.order - b.order;
                });
            }
            // return _.sortBy(docs, function (d) { return !d.url; });
        }

        // / Implementation
        function addDocs (docSku) {
            $cordovaGoogleAnalytics.trackEvent('Lockbox', 'add-doc', docSku, vm.documents.length);

            var docCount = vm.documents.length;
            lockboxDocuments.addDocsPopup(docSku)
                .then(
                    function success (doc) {
                        if (doc) {
                            logger.debug('Added new document with sku `%s` ', doc && doc.sku || doc);

                            sortDocs();
                        }
                        else {
                            logger.debug('No Doc added');
                        }
                        logger.info('Lockbox documents went from ' + docCount + ' to ' + vm.documents.length);
                    })
                .catch(
                    function fail (rejection) {
                        if (rejection.error || _.isUndefined(rejection.error)) {
                            logger.error('Failed to add Documents', rejection);
                        }
                        else {
                            logger.debug('getNewAvatar Aborted %s', rejection.message || rejection);
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
        function newDoc (docSku) {
            $cordovaGoogleAnalytics.trackEvent('Lockbox', 'new-doc', docSku, vm.documents.length);
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
        function orderDocs (doc) {
            $cordovaGoogleAnalytics.trackEvent('Lockbox', 'order', doc && doc.sku, vm.documents.length);
            return lockboxDocuments.orderReports(doc);
        }

        function showEditModal () {
            $cordovaGoogleAnalytics.trackEvent('Lockbox', 'edit', 'click', vm.documents.length);

            var params = {
                documents: vm.documents
            };


            lockboxDocuments.checkAccess()
                .then(function (access) {
                    if (access !== -1 && access) {
                        return lockboxModalsService.showEditModal(params);
                    }

                    LoadingService.showFailure('Lockbox Access Denied');
                    throw new Error('Lockbox Access Denied');

                })
                .then(
                    function (result) {
                        sortDocs();
                        logger.debug('edit document result', result);
                    },
                    function (err) {
                        logger.debug(err);
                    });
        }

        function showShareModal () {
            var params = {
                documents: vm.documents
            };

            $cordovaGoogleAnalytics.trackEvent('Lockbox', 'share', null, vm.documents.length);

            return lockboxModalsService.showShareModal(params)

                .then(function (result) {
                    logger.debug(result);
                })
                .catch(function (err) {
                    LoadingService.showFailure('Lockbox Access Denied');
                    throw new Error('Lockbox Access Denied', err);
                });
        }

        function refreshDocuments () {
            $cordovaGoogleAnalytics.trackEvent('Lockbox', 'refresh', 'start', vm.documents.length);

            return lockboxDocuments.loadDocuments(true)
                .then(function () {
                    sortDocs();
                    logger.debug('[refreshDocuments] Complete', vm.documents);
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                    $cordovaGoogleAnalytics.trackEvent('Lockbox', 'refresh', 'complete', vm.documents.length);
                });
        }
    }
})();
