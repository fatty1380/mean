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
                var AppRsrc = $resource('api/applications/:id', {
                        id: '@_id'
                    }, {
                    update: {
                        method: 'PUT'
                    }
                });

                return new AppRsrc({_id: id, 'status': status}).$update();
            },
            getApplication: function (query) {

                if(!query || !query.hasOwnProperty('applicationId')) {
                    $log.warning('Cannot get application without application ID');
                    return null;
                }

                var rsrc = $resource('api/applications/:applicationId', {
                    applicationId: '@applicationId'
                });

                return rsrc.get(query).$promise;
            },
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
            createConnection: function(application) {
                var rsrc = $resource('/api/applications/:applicationId/connect', {
                    applicationId: '@_id'
                }, {
                    get: {
                        method: 'POST',
                        isArray: false
                    }
                });

                return rsrc.get(application).$promise;
            },
            ForDriver: $resource('api/jobs/:jobId/applications/:userId', {
                jobId: '@jobId',
                userId: '@userId'
            }),
            getMessages: function(applicationId, userId) {
                var rsrc = $resource('api/applications/:applicationId/messages', {
                    companyId: '@companyId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: false
                    }
                });

                return rsrc.query({applicationId: applicationId, userId: userId}).$promise;
            }
        };

        return _this._data;
    };

    ApplicationsService.$inject = ['$resource', '$log'];

    angular.module('applications').factory('Applications', ApplicationsService);


})
();
