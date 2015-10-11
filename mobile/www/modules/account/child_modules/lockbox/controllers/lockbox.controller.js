(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$scope', '$state', '$rootScope', 'securityService', 'documents', 'lockboxDocuments', 'lockboxModalsService', '$ionicPopup', '$ionicLoading', 'welcome'];

    function LockboxCtrl($scope, $state, $rootScope, securityService, documents, lockboxDocuments, lockboxModalsService, $ionicPopup, $ionicLoading, welcome) {


        var vm = this;

        vm.currentDoc = null;
        vm.documents = documents instanceof Array && documents.length ? documents : [] || [];

        vm.addDocsPopup = addDocs;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;

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
                })
                .finally(activate);
            
            /////////////////////////////////////////////
            
            function activate() {

                if (!!state.secured) {
                    scopeData.subTitle = 'Enter your PIN to unlock'
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

                        popup.subTitle = 'Enter your PIN to unlock';
                        popup.title = 'Lockbox Secured';
                    }
                }
            }
        }
    }
})();
