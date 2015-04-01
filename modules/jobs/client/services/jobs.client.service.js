(function () {
    'use strict';

//Jobs service used to communicate Jobs REST endpoints
    function JobsService($resource) {
        return {
            ById: $resource('api/jobs/:jobId', {
                jobId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            }),
            ByUser: $resource('api/users/:userId/jobs', {
                userId: '@userId'
            }),
            ByCompany: $resource('api/companies/:companyId/jobs', {
                companyId: '@companyId'
            }),
            get: function (jobId) {
                var rsrc = $resource('api/jobs/:id', {
                    id: '@id'
                });

                return rsrc.get({id: jobId}).$promise;
            },
            listByCompany: function (query) {
                var rsrc = $resource('/api/companies/:companyId/jobs/applications', {
                    companyId: '@companyId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                });

                return rsrc.query(query).$promise;
            },
            getApplication: function (jobId, userId) {
                var RSRC = $resource('api/jobs/:jobId/applications/:userId', {
                        jobId: '@_id'
                    },
                    {
                        update: {
                            method: 'PUT'
                        }
                    });

                return RSRC.get({jobId: jobId, userId: userId});
            }

        };
    }

    JobsService.$inject = ['$resource'];

    angular
        .module('jobs')
        .factory('Jobs', JobsService);


})();
