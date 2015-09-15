(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('requestService', requestService);

    requestService.$inject = ['$http', 'settings'];

    function requestService($http, settings) {
        return {
            getRequestsList: getRequestsList,
            createRequest: createRequest,
            updateRequest: updateRequest
        };

        function getRequestsList() {
            return $http.get(settings.requests);
        }

        function createRequest(requestData) {
            return $http.post(settings.requests, requestData);
        }

        function updateRequest(id, data) {
            if(!id) return;
            return $http.put(settings.requests + id, data);
        }

    }
})();
