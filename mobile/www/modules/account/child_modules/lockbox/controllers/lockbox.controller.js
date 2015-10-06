(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$scope', '$state', '$rootScope', 'documents', 'lockboxDocuments', 'lockboxModalsService', '$ionicPopup'];

    function LockboxCtrl($scope, $state, $rootScope, documents, lockboxDocuments,  lockboxModalsService, $ionicPopup) {
        var vm = this;

        vm.currentDoc = null;
        vm.userPIN = '0000';
        vm.documents = documents instanceof Array && documents.length ? documents : [] || [];

        vm.addDocsPopup = addDocs;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;

        $rootScope.$on("clear", function () {
            console.log('LockboxCtrl clear');
            vm.currentDoc = null;
            vm.documents = [];
        });

        $scope.$on("$ionicView.beforeEnter", function () {
            $scope.data = {};

            // An elaborate, custom popup
            var pingPopup = $ionicPopup.show({
                template: '<input type="password" ng-model="data.pin" maxlength="4">',
                title: 'Enter PIN',
                subTitle: 'Please enter PIN-code to enter lockbox',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Enter</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.pin) {
                                e.preventDefault();
                            } else {
                                return $scope.data.pin === vm.userPIN;
                            }
                        }
                    }
                ]
            });
            pingPopup.then(function(response) {
                if(!response){
                    $ionicPopup.alert({title: 'Error', template: 'You have entered a wrong PIN-code, redirecting to Profile'}, 1500);
                    $state.go('account.profile')
                }
            });

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
