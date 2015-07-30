(function() {
    'use strict';

    function lockboxCtrl (lockboxDocuments) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;
        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
    }

    lockboxCtrl.$inject = ['lockboxDocuments'];

    angular
        .module('lockbox')
        .controller('lockboxCtrl', lockboxCtrl);

})();
