'use strict';

//Jobs service used to communicate Jobs REST endpoints
function JobsService($resource) {
    return {
        ById: $resource('api/jobs/:jobId', {
            jobId: '@jobId'
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
        })
    };
}

JobsService.$inject = ['$resource'];

angular
    .module('jobs')
    .factory('Jobs', JobsService);
