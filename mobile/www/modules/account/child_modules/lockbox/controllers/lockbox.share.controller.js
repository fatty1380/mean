(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareCtrl', LockboxShareCtrl);

    LockboxShareCtrl.$inject = ['$scope', 'lockboxDocuments'];

    function LockboxShareCtrl($scope, lockboxDocuments) {
        var vm = this;
        vm.cancel = cancel;
        vm.share = share;

        console.log('[LockboxShare] Ctrl Load');
        init();

        function init() {
            vm.documents = [];
            vm.contact = {};
            vm.shareStep = 1;
            return getDocs();
        }

        function getDocs() {
            return lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);
                    vm.documents = response.data instanceof Array && response.data.length ? response.data : lockboxDocuments.getStubDocuments();
                });
        }

        function cancel() {
            var self = this;
            vm.closeModal(null);
            self.shareStep = 1;
        }

        function share() {
            if (vm.shareStep < 2) {
                return;
            }


        }
    }
})();
