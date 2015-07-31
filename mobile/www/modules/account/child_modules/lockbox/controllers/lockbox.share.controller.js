(function() {
    'use strict';

    function LockboxShareCtrl(lockboxDocuments) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;
        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
    }

    LockboxShareCtrl.$inject = ['lockboxDocuments'];

    angular
        .module('account')
        .controller('LockboxShareCtrl', LockboxShareCtrl);

})();
