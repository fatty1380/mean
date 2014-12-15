'use strict';

angular.module('companies')
    .directive('osCompany', [
        function() {
            var ddo = {
                templateUrl: 'modules/companies/views/templates/view-company.client.template.html',
                scope: {
                    company: '=',
                    inline: '='
                },
                restrict: 'E',
                replace: true,
                controller: function() {
                    //debugger;
                },
                controllerAs: 'dm',
                bindToController: true
            };

            return ddo;
        }
    ])
    // TODO : Move to CORE Module
    .directive('osPageHeader', function() {
        var ddo = {
            templateUrl: 'modules/core/views/templates/os-page-header.client.template.html',
            scope: {
                title: '@',
                editSref: '@?',
                showEdit: '=?',
                btnShow: '=?',
                btnText: '@?',
                btnSref: '@?',
                level: '@?'
            },
            transclude: true,
            restrict: 'E',
            controller: ['$transclude', function(transclude) {
                var dm = this;

                dm.hover = false;
                dm.includeTransclude = !!transclude().contents() && transclude().contents().length > 0;
            }],
            controllerAs: 'dm',
            bindToController: true
        };

        return ddo;
    });
