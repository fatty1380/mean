(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .factory('outsetCache', OutsetCache);

    OutsetCache.$inject = ['$cacheFactory'];

    function OutsetCache ($cacheFactory) {
        return $cacheFactory('outsetCache');
    }

})();
