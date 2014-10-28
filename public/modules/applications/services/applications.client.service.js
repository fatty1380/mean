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

    var _this = this;

    _this._data = {
        ByUser: $resource('users/:userId/applications', {
            userId: '@userId'
        }, {
            get: {
                method: 'GET',
                isArray: true
            }
        }),
        ByJob: $resource('jobs/:jobId/applications', {
            jobId: '@jobId'
        }, {
            get: {
                method: 'GET',
                isArray: true
            },
            save: {
                method: 'POST',
            }
        }),
        ById: $resource('applications/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT'
            },
            save: {
                method: 'POST'
            }
        })
    };

    return _this._data;
};

ApplicationsService.$inject = ['$resource'];

angular.module('applications').factory('Applications', ApplicationsService);
