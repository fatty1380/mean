(function() {
    
    'use strict';
    /**
     * Thanks to Ode to code for this one!
     * @source http://odetocode.com/blogs/scott/archive/2014/10/13/confirm-password-validation-in-angularjs.aspx
     * @returns {{require: string, scope: {otherModelValue: string}, link: Function}}
     * @constructor
     */
    var CompareToDirective = function() {
        return {
            require: 'ngModel',
            scope: {
                otherModelValue: '=compareTo'
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue === scope.otherModelValue;
                };

                scope.$watch('otherModelValue', function() {
                    ngModel.$validate();
                });
            }
        };
    };

    angular.module('core')        
        .directive('compareTo', CompareToDirective);


})();