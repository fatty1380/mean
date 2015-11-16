(function () {
    'use strict';

    function DocumentListController(Reports, toastr) {
        var vm = this;

        vm.showDocument = function (doc, $event) {
            $event.stopPropagation();

            var file = vm.profile.reports[doc];

            Reports.openReport(vm.application, vm.profile, file)
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
                profile: '=',
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
