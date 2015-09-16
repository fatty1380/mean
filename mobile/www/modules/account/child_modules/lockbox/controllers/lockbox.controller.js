(function () {
    'use strict';

    angular
        .module('lockbox', ['pdf'])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$scope', '$rootScope', 'lockboxDocuments', 'lockboxModalsService'];

    function LockboxCtrl( $scope, $rootScope, lockboxDocuments,  lockboxModalsService) {
        var vm = this;

        vm.currentDoc = null;
        vm.documents = [];

        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
        vm.showEditModal = showEditModal;
        vm.showShareModal = showShareModal;

        $rootScope.$on("clear", function () {
            console.log('LockboxCtrl clear');
            vm.currentDoc = null;
            vm.documents = [];
        });

        $scope.$on('$ionicView.enter', function () {
            getDocs();
        });
        
        /// Implementation

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
