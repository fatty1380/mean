(function () {
    'use strict';

    function DocumentListController(Reports, toastr) {
        var vm = this;

        vm.showDocument = function (doc, $event) {
            $event.stopPropagation();

            var file = vm.driver.reports[doc];

            Reports.openReport(vm.application, vm.driver, file)
                .catch(function (error) {
                    vm.error = error;
                    toastr.error(error, {
                        extendedTimeOut: 5000
                    });

                });
        };


    }

    function DocumentListDirective() {

        var ddo = {
            templateUrl: function(elem, attrs) {
                switch(attrs.displayMode) {
                    case 'full': return '/modules/bgchecks/views/templates/document-list-dd.client.template.html';
                    case 'inline': return '/modules/bgchecks/views/templates/document-list-inline.client.template.html';
                    default: return '/modules/bgchecks/views/templates/document-list-dd.client.template.html';
                }

            } ,
            restrict: 'E',
            scope: {
                driver: '=',
                application: '=',
                docAccess: '=?',
                displayMode: '='
            },
            controller: 'DocumentListController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    DocumentListController.$inject = ['Reports', 'toastr'];

    angular
        .module('bgchecks')
        .controller('DocumentListController', DocumentListController)
        .directive('osetDocumentList', DocumentListDirective);

})();
