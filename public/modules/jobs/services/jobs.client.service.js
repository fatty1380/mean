'use strict';

//Jobs service used to communicate Jobs REST endpoints
function JobsService($resource) {
    return {
        ById: $resource('jobs/:jobId', {
            jobId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        ByUser: $resource('users/:userId/jobs', {
            userId: '@_id'
        }),
        ByCompany: $resource('companies/:companyId/jobs', {
            companyId: '@_company'
        })
    };
}

JobsService.$inject = ['$resource'];

angular
    .module('jobs')
    .factory('Jobs', JobsService);
