'use strict';

//Applications service used to communicate Applications REST endpoints

/**
* service.factory('ProductsRest', ['$resource', function ($resource) {
    return $resource('service/products/:dest', {}, {
        query: {method: 'GET', params: {dest:"allProducts"}, isArray: true },
        save: {method: 'POST', params: {dest:"modifyProduct"}},
        update: { method: 'POST', params: {dest:"modifyProduct"}},
    });
}]);
*/

var ApplicationsService = function($resource) {
    return {
        ByUser: $resource('users/:userId/applications', {
            userId: '@_id'
        }),
        ByJob: $resource('jobs/:jobId/applications', {
            jobId: '@_id'
        }),
        ById: $resource('applications/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        })
    };
};

ApplicationsService.$inject = ['$resource'];

angular.module('applications').factory('Applications', ApplicationsService);
