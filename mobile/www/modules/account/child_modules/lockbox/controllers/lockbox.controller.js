(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$ionicModal', '$scope', '$sce', '$ionicLoading', 'lockboxDocuments', '$ionicPopup', 'lockboxModalsService'];

    function LockboxCtrl($ionicModal, $scope, $sce, $ionicLoading, lockboxDocuments, $ionicPopup, lockboxModalsService) {
        var vm = this;


        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;

        vm.currentDoc = null;
        vm.documents = [];

        activate();
        
        /// Implementation
        
        function activate() {
            getDocs();
        }

        function getDocs() {
            lockboxDocuments.getDocuments()
                .then(
                    function (response) {
                        console.log('Documents List', response);
                        vm.documents = response.data instanceof Array && response.data.length ? response.data : lockboxDocuments.getStubDocuments();
                    },
                    function (response) {
                        console.log('Documents !!!', response);
                        vm.documents = lockboxDocuments.getStubDocuments();
                    });
        }

        function showEditModal(parameters) {
            lockboxModalsService.showLockboxEditModal(parameters)
                .then(
                    function (result) {
                        console.log(result);
                    },
                    function (err) {
                        console.log(err);
                    })
        };

        function showShareModal(parameters) {
            debugger;
            lockboxModalsService.showLockboxShareModal(parameters)
                .then(
                    function (result) {
                        console.log(result);
                    },
                    function (err) {
                        console.log(err);
                    })
        };
    }
})();
