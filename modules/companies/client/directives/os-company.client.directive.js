(function() {
    'use strict';

    function CompanyDirectiveController (Authentication) {
        var dm = this;

        dm.user = Authentication.user;

        dm.createText = 'Before posting any jobs, you will need to create your company profile. Click the button below to continue.';
    }

    function CompanyDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/companies/views/templates/view-company.client.template.html',
            scope: {
                company: '=',
                inline: '='
            },
            restrict: 'E',
            replace: true,
            controller: 'CompanyDirectiveController',
            controllerAs: 'dm',
            bindToController: true
        };

        return ddo;
    }

    function PageHeaderDirective () {
        var ddo;
        ddo = {
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
            controller: ['$transclude', function (transclude) {
                var dm = this;

                dm.btnShow = typeof this.btnShow === 'undefined' ? true : this.btnShow;
                dm.showEdit = typeof this.showEdit === 'undefined' ? false : this.showEdit;

                dm.hover = false;
                dm.includeTransclude = !!transclude().contents() && transclude().contents().length > 0;
            }],
            controllerAs: 'dm',
            bindToController: true
        };

        return ddo;
    }

    CompanyDirectiveController.$inject = ['Authentication'];

    angular.module('companies')
        .controller('CompanyDirectiveController', CompanyDirectiveController)
        .directive('osCompany', CompanyDirective)
        // TODO : Move to CORE Module
        .directive('osPageHeader', PageHeaderDirective);

})();
