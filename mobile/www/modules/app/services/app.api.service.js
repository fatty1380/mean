(function () {
    'use strict';

    angular.module(AppConfig.appModuleName)
        .factory('API', serverConnectionService);

    serverConnectionService.$inject = ['$http', '$q'];    

    function serverConnectionService ($http, $q) {
        var service = {
            doRequest: doApiRequest
        };

        return service;

        // ////////////////////////////////////////////////////

        // TODO: Verify in all places that replacement of 'application/form-encoded'
        // with 'application/json' will work properly ... seriosuly, who does that?
        function doApiRequest (apiUrl, method, data) {
            var req = $http({
                url: apiUrl,
                method: method,
                data: data,
                timeout: 30 * 1000
            });

            return req;            
        }
    }

})();
