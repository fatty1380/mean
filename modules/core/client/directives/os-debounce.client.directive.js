(function () {
    'use strict';

    function DebounceDirective() {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, controller) {
                if (!controller.$options) {
                    controller.$options = {
                        updateOn: 'default blur',
                        debounce: {
                            'default': 3000,
                            'blur': 0
                        },
                        updateOnDefault: true
                    };
                }
            }
        };
    }

    //ng-model-options="{ updateOn: 'default blur', debounce: { 'default': 300, 'blur': 0 } }">


    angular.module('core')
        .directive('debounce', DebounceDirective);


})();