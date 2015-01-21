(function () {
    'use strict';
//Applications service used to communicate Applications REST endpoints

    /**
     * service.factory('ProductsRest', ['$resource', function ($resource) {
    return $resource('api/service/products/:dest', {}, {
        query: {method: 'GET', params: {dest:"allProducts"}, isArray: true },
        save: {method: 'POST', params: {dest:"modifyProduct"}},
        update: { method: 'POST', params: {dest:"modifyProduct"}},
    });
}]);
     */

    var ApplicationsService = function ($resource) {

        var _this = this;

        _this._data = {
            ByJob: $resource('api/jobs/:jobId/applications', {
                jobId: '@jobId'
            }, {
                query: {
                    method: 'GET',
                    isArray: true
                },
                save: {
                    method: 'POST'
                }
            }),
            ById: $resource('api/applications/:id', {
                id: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                save: {
                    method: 'POST'
                }
            }),
            listByUser: function (query) {
                var rsrc = $resource('api/users/:userId/applications', {
                    userId: '@userId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                });

                return rsrc.query(query).$promise;
            },
            listByCompany: function (query) {
                var rsrc = $resource('api/companies/:companyId/applications', {
                    companyId: '@companyId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                });

                return rsrc.query(query).$promise;

            },
            ForDriver: $resource('api/jobs/:jobId/applications/:userId', {
                jobId: '@jobId',
                userId: '@userId'
            })
        };

        return _this._data;
    };

    ApplicationsService.$inject = ['$resource'];

    angular.module('applications').factory('Applications', ApplicationsService);


})
();
