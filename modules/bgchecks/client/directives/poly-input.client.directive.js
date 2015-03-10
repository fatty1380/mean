(function() {
    'use strict';

    function PolyInputDirective($compile, PolyFieldSvc) {
        var linkFn = function(scope, element, attributes) {

            // create input element depending on the type

            var field = PolyFieldSvc.translateWithThis(scope.storage, scope.polyData);
            var template = document.createElement('input');

            if(!!field.ngType) {
                template.type = field.ngType;

                if(!!field.ngMaxLength) {
                    template.setAttribute('ng-maxlength', field.ngMaxLength);
                }
            } else if(field.isDate) {
                template = document.createElement('date-input');
                template.setAttribute('format', 'field.format');


            }

            template.name = field.name;

            //template.type = scope.storage[attributes.key].type;



            // copy all attributes
            for (var attr in attributes.$attr) {
                if (attributes.$attr[attr] === 'ng-model') {
                    template.setAttribute('ng-model', attributes[attr] + '[' + attributes.key + ']');
                } else {
                    template.setAttribute(attributes.$attr[attr], attributes[attr]);
                }
            }

            // template compilation, linking and element replacement
            template = angular.element(template);
            element.replaceWith(template);
            var linkTemplate = $compile(template);
            var domElement = linkTemplate(scope);
        };

        var ddo = {
            restrict: 'E',
            scope: {
                meta: '=',
                storage: '=ngModel',
                key: '=',
                polyData: '='
            },
            link: linkFn
        };

        return ddo;
    }

    PolyInputDirective.$inject = ['$compile', 'PolyFieldService'];

    angular.module('bgchecks').directive('polyInput', PolyInputDirective);
})();
