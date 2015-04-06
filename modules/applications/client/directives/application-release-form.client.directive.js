(function () {
    'use strict';

    function ApplicationReleaseFormCtrl($log, $q, Gateway, Applications) {
        var vm = this;

        vm.text = _.defaults(vm.text || {}, {
            about: null
        });

        vm.methods = {
            init: function () {
                vm.companyName = Gateway.models.applicantGateway.entityName || Gateway.models.company.name;
            },
            submit: function () {

            },
            validate: function () {
            }
        };

        $q.when(vm.report).then(vm.methods.init);
    }

    ApplicationReleaseFormCtrl.$inject = ['$log', '$q', 'Gateway', 'Applications'];

    function ApplicationReleaseFormDirective() {
        return {
            templateUrl: '/modules/applications/views/form/authorization.client.template.html',
            restrict: 'E',
            require: ['^form'],
            scope: {
                text: '=?',
                methods: '=?',
                release: '=?model'
            },
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
            },
            controller: 'ApplicationReleaseFormController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    angular.module('drivers')
        .controller('ApplicationReleaseFormController', ApplicationReleaseFormCtrl)
        .directive('applicationReleaseForm', ApplicationReleaseFormDirective);
})();
