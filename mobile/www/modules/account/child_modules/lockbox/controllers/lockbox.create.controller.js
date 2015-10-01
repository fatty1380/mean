(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxCreateCtrl', LockboxCreateCtrl);

    LockboxCreateCtrl.$inject = ['$ionicPopup', '$ionicLoading',  '$sce', 'settings', 'parameters'];

    function LockboxCreateCtrl($ionicPopup, $ionicLoading, $sce, settings, parameters) {
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
                        vm.cancelModal('canceled');
                    }
            });
        }

        function setDocumentName (newVal, oldVal) {
            if (vm.document.sku !== 'other') {
                if (vm.document.sku !== 'misc') {
                    vm.document.name = null;
                }
                return;
            }
            vm.data = {};

            var namePopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.name" autofocus />',
                title: 'Enter document name',
                scope: vm,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Confirm</b>',
                        type: 'button-positive',
                        onTap: function() {
                            if (vm.data.name) {
                                return vm.data.name;
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
                } else {
                    vm.document.sku = oldVal;
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
            
            return vm.closeModal(vm.document);
        }
    }
})();
