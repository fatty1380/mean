(function () {
    'use strict';

    function ApplicationQuestionFormCtrl($log, $q, Gateway, Applications, PolyField) {
        var vm = this;

        vm.questions = Applications.getQuestions();
        vm.responses = {};

        vm.text = _.defaults(vm.text || {}, {
            about: null
        });

        vm.methods = {
            init: function () {
                debugger;
                _.map(vm.questions, function(question) {
                    PolyField.translateWithThis(vm.responses, question);
                });
            },
            submit: function () {

            },
            validate: function () {
            }
        };

        vm.report = Gateway.report;
        vm.applicant = Gateway.applicant;

        $q.when(vm.report).then(vm.methods.init);
    }

    ApplicationQuestionFormCtrl.$inject = ['$log', '$q', 'Gateway', 'Applications', 'PolyFieldService'];

    function ApplicationQuestionFormDirective() {
        return {
            templateUrl: '/modules/applications/views/templates/application-questionnaire-form.client.template.html',
            restrict: 'E',
            require: ['^form'],
            scope: {
                text: '=?',
                methods: '=?',
                questions: '=?',
                responses: '=?'
            },
            link: function (scope, element, attrs, ctrls) {
                debugger;
                scope.vm.form = ctrls[0];
            },
            controller: 'ApplicationQuestionFormController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    angular.module('drivers')
        .controller('ApplicationQuestionFormController', ApplicationQuestionFormCtrl)
        .directive('applicationQuestionnaireForm', ApplicationQuestionFormDirective);
})();
