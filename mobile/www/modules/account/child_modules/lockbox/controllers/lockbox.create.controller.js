(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxCreateCtrl', LockboxCreateCtrl);

    LockboxCreateCtrl.$inject = ['$scope', '$ionicPopup', '$ionicLoading',  '$sce', 'settings', 'parameters'];

    function LockboxCreateCtrl($scope, $ionicPopup, $ionicLoading, $sce, settings, parameters) {
        var vm = this;

        vm.cancel = cancel;
        vm.saveDocument = saveDocument;
        vm.setDocumentName = setDocumentName;

        init();

        function init() {
            vm.document = {
                url: !!parameters.image ? 'data:image/jpeg;base64,' + parameters.image : settings.defaultProfileImage,
                name: '',
                sku: parameters.sku || '',
                valid: {
                    from: null,
                    until: null
                }
            };
            
            vm.trustedSrc = $sce.trustAsResourceUrl(vm.document.url);
        }

        function cancel() {
            var confirmPopup = $ionicPopup.confirm({
                    title: 'Discard Changes?',
                    cancelType: 'button-small',
                    okType: 'button-small button-assertive',
                    template: 'Are you sure you want to discard this document?'
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        $scope.closeModal();
                    }
            });
        }

        function setDocumentName () {
            if(vm.document.sku !== 'other') return;

            $scope.data = {};

            var namePopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.name" autofocus />',
                title: 'Enter document name',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Confirm</b>',
                        type: 'button-positive',
                        onTap: function() {
                            if ($scope.data.name) {
                                return $scope.data.name;
                            } else {
                                return '';
                            }
                        }
                    }
                ]
            });

            namePopup.then(function(res) {
                if(res){
                    vm.document.name = res;
                    vm.document.sku = 'misc'
                }
            });
        }

        function saveDocument() {
            $ionicLoading.show({ template: '<ion-spinner/><br>Saving...', duration: 10000 });
                    
            if (vm.document.sku !== 'misc') {
                switch (vm.document.sku) {
                    case 'cdl': vm.document.name = 'Commercial Driver License'; break;
                    case 'ins': vm.document.name = 'Insurance'; break;
                    case 'reg': vm.document.name = 'Registration'; break;
                    default: vm.document.name = vm.document.sku;
                }
            }
            
            return $scope.closeModal(vm.document);
        }
    }
})();
