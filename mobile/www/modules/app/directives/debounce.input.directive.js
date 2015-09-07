(function () {
    'use strict';
    
    /**
     * Debounce Text Input
     * Adding this directive to a text input will delay updating the model for
     * 500ms. This helps with preventing extra validation, or extra search calls
     * to the server and should be added wherever needed.
     */
	
    angular.module(AppConfig.appModuleName)
        .directive('debounce', DebounceDirective);
        
	function DebounceDirective() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, controller) {
                if (!controller.$options) {
                    controller.$options = {
                        updateOn: 'default blur',
                        debounce: {
                            'default': 500,
                            'blur': 0
                        },
                        updateOnDefault: true
                    };
                }
            }
        };
    }

})();