(function () {
    'use strict';

    var lockboxShareService = function () {
        var vm = this;

        vm.documents = [
            {
                name: 'Document',
                date: '3/17/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/13/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/12/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/11/2015',
                checked: false
            }
        ]
    };

    lockboxShareService.$inject = [];

    angular
        .module('lockbox')
        .service('lockboxShareService', lockboxShareService);

})();
