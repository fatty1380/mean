(function() {
    'use strict';

    var FormInputDirective = function() {
        var ddo = {
            restrict: 'E',
            require: ['^form'],
            templateUrl: function(elem,attrs) {
                switch(attrs.mode) {
                    case 'static': return '/modules/bgchecks/views/templates/form-static.client.template.html';
                    case 'input': return '/modules/bgchecks/views/templates/form-input.client.template.html';
                        default: return '/modules/bgchecks/views/templates/custom-form.client.template.html';
                }
            },
            scope: {
                field: '=',
                model: '='
            },
            controller: function() {
                var vm = this;
            },
            controllerAs: 'vm',
            bindToController: true,
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
            }
        };

        return ddo;
    };

    var FormStaticDirective = function() {
        var ddo = {
            restrict: 'E',
            templateUrl: '/modules/bgchecks/views/templates/form-static.client.template.html',
            scope: {
                field: '=',
                model: '='
            },
            controller: function() {
                var vm = this;
            },
            controllerAs: 'vm',
            bindToController: true,
            link: function (scope, element, attrs, ctrls) {
                scope.vm.form = ctrls[0];
            }
        };

        return ddo;
    };

    angular.module('bgchecks')
    .directive('formInput', FormInputDirective)
    .directive('formStatic', FormStaticDirective);
})();
