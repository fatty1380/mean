(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .filter('getChecked', getChecked);

    function getChecked() {
        return function (itemsToFilter, params) {
            if (!itemsToFilter) return;
            var filteredItems = [],
                item, i;

            for (i = 0; i < itemsToFilter.length; i++) {
                item = itemsToFilter[i];

                if (item.$$hashKey) delete item.$$hashKey;

                if (item.checked) {
                    if (!params || params.clearChecked) delete item.checked;
                    filteredItems.push(item);
                }

            }

            return filteredItems;
        };
    }



    angular.module(AppConfig.appModuleName)
        .filter('prettyPrint', prettyPrint);
    function prettyPrint() {
        return function (input) {
            return (!!input) ? JSON.stringify(input, undefined, 2) : '';
        };
    }

})();
