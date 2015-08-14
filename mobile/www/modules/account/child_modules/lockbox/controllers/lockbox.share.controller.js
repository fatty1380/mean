(function() {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareCtrl', LockboxShareCtrl);

    LockboxShareCtrl.$inject = ['$scope', 'lockboxDocuments'];

    function LockboxShareCtrl($scope, lockboxDocuments) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments.getDocuments();
        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
        vm.shareStep = 1;

        vm.cancel = function () {
            var self = this;

            $scope.closeModal(null);

            self.shareStep = 1;
        }
    }

})();
