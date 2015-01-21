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
            listByCompany: function(query) {
                var rsrc = $resource('/api/companies/:companyId/jobs/applications', {
                    companyId: '@companyId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                });

                return rsrc.query(query).$promise;
            }

        };
    }

    JobsService.$inject = ['$resource'];

    angular
        .module('jobs')
        .factory('Jobs', JobsService);


})();
