(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$scope', '$state', '$rootScope', 'securityService', 'documents', 'lockboxDocuments', 'lockboxModalsService', '$ionicPopup', '$ionicLoading', 'welcome'];

    function LockboxCtrl($scope, $state, $rootScope, securityService, documents, lockboxDocuments, lockboxModalsService, $ionicPopup, $ionicLoading, welcome) {


        var vm = this;

        vm.currentDoc = null;
        vm.documents = documents instanceof Array ? documents : [] || [];

        vm.addDocsPopup = addDocs;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;
        vm.refreshDocuments = refreshDocuments;
        
        vm.newDoc = newDoc;
        vm.orderDocs = orderDocs;

        vm.lockboxClear = false;

        $scope.$on("$ionicView.beforeEnter", checkLockboxAccess);

        $rootScope.$on("clear", function () {
            console.log('LockboxCtrl clear');
            vm.currentDoc = null;
            vm.documents = [];
            securityService.logout();
        });

        /// Implementation
        function addDocs(docSku) {
            var docCount = vm.documents.length;
            lockboxDocuments.addDocsPopup(docSku)
                .then(
                function success(doc) {
                    if (!!doc) {
                        console.log('Added new document with sku `%s` ', doc && doc.sku || doc);
                            vm.documents = lockboxDocuments.updateDocumentList();
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
            var params = {
                documents: vm.documents
            };
            lockboxModalsService.showEditModal(params)
                .then(
                    function (result) {
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

        function refreshDocuments () {
            lockboxDocuments.getDocuments(true)
                .finally(function () {
                    vm.documents = lockboxDocuments.updateDocumentList();
                    // Stop the ion-refresher from spinning
                    $scope.$broadcast('scroll.refreshComplete');
                });
    }

        function checkLockboxAccess() {
            // TODO: refactor and move to service
            // Step 1: Pulled out into standalone function

            $scope.data = {
                title: 'Enter PIN',
                subTitle: 'Secure your Lockbox with a 4 digit PIN'
            };

            var scopeData = $scope.data;
            var state = securityService.getState();
            var PIN;

            var pinPopup;
            scopeData.closePopup = closePINPopup;
            scopeData.pinChange = pinChanged;

            //TODO: refactor this
            // Step 1: extracted into activate function
            
            
            securityService
                .getPin()
                .then(function (pin) {
                    PIN = pin;
                    state = securityService.getState();
                })
                .finally(activate);
            
            /////////////////////////////////////////////
            
            function activate() {

                if (!!state.secured) {
                    scopeData.subTitle = 'Enter your PIN to unlock'
                }

                if (!PIN) {
                    securityService
                        .getPin()
                        .then(function (pin) {
                            PIN = pin;
                        });
                }

                if (!state.accessible) {
                    pinPopup = $ionicPopup.show(getPinObject());
                    pinPopup.then(function (accessGranted) {
                        if (!accessGranted) {
                            $state.go('account.profile')
                        }
                    });
                }
            }

            function getPinObject() {
                return {
                    template: '<input class="pin-input" type="tel" ng-model="data.pin" ng-change="data.pinChange(this)" maxlength="4" autofocus>',
                    title: scopeData.title,
                    subTitle: scopeData.subTitle,
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel', type: 'button-small' }
                    ]
                };
            }

            function closePINPopup(data) {
                pinPopup.close(data);
            }

            function pinChanged(popup) {
                if (scopeData.pin.length !== 4) return;

                if (!scopeData.confirm && !state.secured) {

                    scopeData.confirm = true;
                    scopeData.newPin = scopeData.pin;
                    scopeData.pin = '';
                    popup.subTitle = 'Please confirm your PIN';
                    popup.title = 'Confirm New PIN';

                } else if (state.secured && PIN && (scopeData.pin === PIN)) {
                    scopeData.closePopup(securityService.unlock(scopeData.pin));

                    $ionicLoading.show({
                        template: '<i class="icon ion-unlocked"></i><br>Unlocked',
                        duration: 1000
                    })
                } else if (state.secured && PIN && scopeData.pin != PIN) {
                    scopeData.pin = '';
                } else if (scopeData.confirm && !state.secured) {
                    if (scopeData.pin === scopeData.newPin) {
                        securityService.setPin(scopeData.pin);
                        scopeData.closePopup(securityService.unlock(scopeData.pin));

                        $ionicLoading.show({
                            template: '<i class="icon ion-locked"></i><br>Documents Secured',
                            duration: 1000
                        })
                    } else {
                        scopeData.confirm = false;
                        scopeData.pin = '';

                        delete scopeData.newPin;

                        popup.subTitle = 'Secure your Lockbox with a 4 digit PIN';
                        popup.title = 'Confirmation Failed';
                    }
                }
            }
        }
    }
})();
