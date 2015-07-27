(function() {
    'use strict';

    function lockboxCtrl() {
        var vm = this;

        vm.docs = [
            { name: 'Document', icon:"ico ico-documentimageev",  date:'23/11/2008' },
            { name: 'my doc', icon:"ico ico-documentimagemvr", date:'12/10/2010' },
            { name: 'some doc', icon:"ico ico-documentimagebg", date:'22/05/2014' }
        ]
    }

    lockboxCtrl.$inject = [];

    angular
        .module('lockbox')
        .controller('lockboxCtrl', lockboxCtrl);

})();
