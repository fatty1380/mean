/* global AppConfig */
(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('requestService', requestService);

    requestService.$inject = ['friendsService'];

    function requestService (friendsService) {
        return {
            getRequestsList: friendsService.getRequestsList,
            createRequest: friendsService.createRequest,
            updateRequest: friendsService.updateRequest
        };
    }

})();
