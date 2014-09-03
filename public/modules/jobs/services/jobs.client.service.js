'use strict';

//Jobs service used to communicate Jobs REST endpoints
function JobsService($resource) {
    return $resource('jobs/:jobId', {
        jobId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}

JobsService.$inject = ['$resource'];

angular.module('jobs').factory('Jobs', JobsService);
