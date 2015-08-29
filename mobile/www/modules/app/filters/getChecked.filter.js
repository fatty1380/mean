(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .filter('getChecked', getChecked);

    function getChecked() {
        return function (itemsToFilter) {
            var filteredItems = [],
                item, i;

            for(i = 0; i < itemsToFilter.length; i++){
                item = itemsToFilter[i];
                if (item.checked){
                    filteredItems.push(item);
                }
            }

            return filteredItems;
        }
    }

})();
