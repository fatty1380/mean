(function () {
    'use strict';

//Jobs service used to communicate Jobs REST endpoints
    function JobsService($resource, $q) {

        var jobRsrc = $resource('api/jobs/:id', {
            id: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });

        return {

            ById: jobRsrc,
            ByUser: $resource('api/users/:userId/jobs', {
                userId: '@userId'
            }),
            list: function(query) {
                return jobRsrc.query(query).$promise;
            },
            get: function (jobId) {
                return jobRsrc.get({id: jobId}).$promise;
            },
            listByCompany: function (query) {
                // Maintain this method because it populates the applications
                var rsrc = $resource('/api/companies/:companyId/jobs/applications', {
                    companyId: '@companyId'
                }, {});

                return rsrc.query(query).$promise;
            }

        };
    }

    JobsService.$inject = ['$resource', '$q'];

    angular
        .module('jobs')
        .factory('Jobs', JobsService);


})();
