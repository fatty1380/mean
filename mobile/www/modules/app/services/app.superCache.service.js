(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .factory('outsetCache', appCache);

    appCache.$inject = ['$cacheFactory'];

    function appCache($cacheFactory) {
        return $cacheFactory('outsetCache');
    }

})();
