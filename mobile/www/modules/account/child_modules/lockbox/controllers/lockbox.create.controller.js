(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxCreateCtrl', LockboxCreateCtrl);

    LockboxCreateCtrl.$inject = ['$ionicPopup', '$scope', 'LoadingService', '$sce', 'settings', 'parameters'];

    function LockboxCreateCtrl ($ionicPopup, $scope, LoadingService, $sce, settings, parameters) {
        var vm = this;

        vm.cancel = cancel;
        vm.saveDocument = saveDocument;
        vm.setDocumentName = setDocumentName;

        init();

        function init () {
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

            if (/other|misc/i.test(vm.document.sku)) {
                showNamePopup();
            }
        }

        function cancel () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Discard Changes?',
                cancelType: 'button-small',
                okType: 'button-small button-assertive',
                template: 'Are you sure you want to discard this document?'
            });
            confirmPopup.then(function (res) {
                if (res) {
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

            showNamePopup(oldVal);
        }

        function showNamePopup (originalValue) {
            $scope.data = {};
            originalValue = originalValue || '';

            var namePopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.name" autofocus />',
                title: 'Enter Document Name',
                scope: $scope, // TODO: Remove $scope when $ionicPopup supports it
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Confirm</b>',
                        type: 'button-positive',
                        onTap: function () {
                            if ($scope.data.name) {
                                return $scope.data.name;
                            }

                            return '';

                        }
                    }
                ]
            });

            namePopup.then(function (res) {
                if (res && !_.isEmpty(res)) {
                    vm.document.name = res;
                    vm.document.sku = 'misc';
                } else {
                    vm.document.sku = originalValue;
                }
            });
        }

        function saveDocument () {
            LoadingService.showLoader('Saving');

            if (!vm.document.sku) {
                LoadingService.showAlert('Please select document type above');
                return;
            }

            if (vm.document.sku !== 'misc') {
                switch (vm.document.sku) {
                    case 'res': vm.document.name = 'Resume'; break;
                    case 'cdl': vm.document.name = 'Commercial Driver License'; break;
                    case 'ins': vm.document.name = 'Insurance'; break;
                    default: vm.document.name = vm.document.sku;
                }
            }

            return vm.closeModal(vm.document);
        }
    }
})();
