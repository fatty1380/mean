(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .filter('capitalize', capitalizeFilter);

    function capitalizeFilter () {
        return function (input) {
            if (input !== null) {
                input = input.toLowerCase();
            }
            return input.substring(0, 1).toUpperCase() + input.substring(1);
        };
    }
})();
