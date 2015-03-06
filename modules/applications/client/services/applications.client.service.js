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

    var ApplicationsService = function ($resource, $log) {

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
            setStatus: function(id, status) {
                var RSRC = $resource('api/applications/:id', {
                        id: '@_id'
                    }, {
                    update: {
                        method: 'PUT'
                    }
                });

                return new RSRC({_id: id, 'status': status}).$update();
            },
            getApplication: function (query) {

                if(!query || !query.hasOwnProperty('applicationId')) {
                    $log.warning('Cannot get application without application ID');
                    return null;
                }

                var RSRC = $resource('api/applications/:applicationId', {
                    applicationId: '@applicationId'
                });

                return RSRC.get(query).$promise;
            },
            listByUser: function (query) {
                var RSRC = $resource('api/users/:userId/applications', {
                    userId: '@userId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                });

                return RSRC.query(query).$promise;
            },
            listByCompany: function (query) {
                var RSRC = $resource('api/companies/:companyId/applications', {
                    companyId: '@companyId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                });

                return RSRC.query(query).$promise;

            },
            createConnection: function(application) {
                var RSRC = $resource('/api/applications/:applicationId/connect', {
                    applicationId: '@_id'
                }, {
                    get: {
                        method: 'POST',
                        isArray: false
                    }
                });

                return RSRC.get(application).$promise;
            },
            ForDriver: $resource('api/jobs/:jobId/applications/:userId', {
                jobId: '@jobId',
                userId: '@userId'
            }),
            getMessages: function(applicationId, userId) {
                var RSRC = $resource('api/applications/:applicationId/messages', {
                    companyId: '@companyId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: false
                    }
                });

                return RSRC.query({applicationId: applicationId, userId: userId}).$promise;
            }
        };

        return _this._data;
    };

    ApplicationsService.$inject = ['$resource', '$log'];

    angular.module('applications').factory('Applications', ApplicationsService);


})
();
