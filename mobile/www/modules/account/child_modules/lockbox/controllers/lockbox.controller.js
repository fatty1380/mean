(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['lockboxDocuments', 'lockboxModalsService'];

    function LockboxCtrl( lockboxDocuments,  lockboxModalsService) {
        var vm = this;

        vm.currentDoc = null;
        vm.documents = [];

        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;


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
            lockboxModalsService.showLockboxShareModal(parameters)
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
