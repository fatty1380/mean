(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$scope', '$state', '$rootScope', 'securityService', 'documents', 'lockboxDocuments', 'lockboxModalsService', '$ionicPopup'];

    function LockboxCtrl($scope, $state, $rootScope, securityService, documents, lockboxDocuments,  lockboxModalsService, $ionicPopup) {
        $scope.$on("$ionicView.beforeEnter", function () {
            // TODO: refactor and move to service

            $scope.data = {
                title: 'Enter PIN',
                subTitle: 'Please enter a 4 digit Lockbox PIN'
            };

            var scopeData = $scope.data,
                state = securityService.getState(),
                PIN = securityService.getPin(),
                pinObject = {
                    template: '<input type="tel" ng-model="data.pin" ng-change="data.pinChange(this)" maxlength="4">',
                    title: scopeData.title,
                    subTitle: scopeData.subTitle,
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel', type: 'button-small' }
                    ]
                },
                pingPopup;

            //TODO: refactor this
            if(!!PIN.then){
                securityService
                    .getPin().then(function (pin) {
                        PIN = pin;
                    });
            }

            scopeData.closePopup = function (data) {
                pingPopup.close(data);
            };

            scopeData.pinChange = function (popup) {
                if(scopeData.pin.length !== 4) return;

                if(!scopeData.confirm && !state.secured){

                    scopeData.confirm = true;
                    scopeData.newPin = scopeData.pin;
                    scopeData.pin = '';
                    popup.subTitle = 'Please confirm Lockbox PIN';
                    popup.title = 'Confirm';

                } else if (state.secured && PIN && (scopeData.pin === PIN)) {
                    scopeData.closePopup(securityService.unlock(scopeData.pin));
                } else if (state.secured && PIN && scopeData.pin != PIN) {
                    scopeData.pin = '';
                } else if (scopeData.confirm && !state.secured){

                    if(scopeData.pin === scopeData.newPin){
                        securityService.setPin(scopeData.pin);
                        scopeData.closePopup(securityService.unlock(scopeData.pin));
                    }else{

                        scopeData.confirm = false;
                        scopeData.pin = '';

                        delete scopeData.newPin;

                        popup.subTitle = 'Please enter Lockbox PIN';
                        popup.title = 'Enter PIN';
                    }
                }
            };

            if(!state.accessible){
                pingPopup = $ionicPopup.show(pinObject);
                pingPopup.then(function(accessGranted) {
                    if(!accessGranted){
                        $state.go('account.profile')
                    }
                });
            }
        });

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
