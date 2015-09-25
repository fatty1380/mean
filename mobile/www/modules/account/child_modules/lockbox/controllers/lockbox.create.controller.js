(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxCreateCtrl', LockboxCreateCtrl);

    LockboxCreateCtrl.$inject = ['$scope', '$ionicPopup', '$sce', 'settings', 'parameters'];

    function LockboxCreateCtrl($scope, $ionicPopup, $sce, settings, parameters) {
        var vm = this;
        vm.cancel = cancel;
        vm.saveDocument = saveDocument;

        init();

        function init() {
            
            vm.document = {
                url: $sce.trustAsResourceUrl(!!parameters.image ? 'data:image/jpeg;base64,' + parameters.image : settings.defaultProfileImage),
                name: '',
                sku: '',
                valid: {
                    from: null,
                    until: null
                }
            }
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
        };

        function saveDocument() {
            return $scope.closeModal(vm.document);
        };
    }
})();
