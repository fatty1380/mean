(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareCtrl', LockboxShareCtrl);

    LockboxShareCtrl.$inject = ['$scope', 'lockboxDocuments'];

    function LockboxShareCtrl($scope, lockboxDocuments) {
        var vm = this;

        init();


        function init() {
            vm.documents = [];
            vm.addDocsPopup = lockboxDocuments.addDocsPopup;
            vm.shareStep = 1;
            getDocs();
        }

        function getDocs () {
            lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);
                    vm.documents = response.data instanceof Array && response.data.length ? response.data : lockboxDocuments.getStubDocuments();
                });
        }

        vm.cancel = function () {
            var self = this;

            $scope.closeModal(null);

            self.shareStep = 1;
        }
    }

})();
