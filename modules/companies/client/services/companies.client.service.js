(function() {
    'use strict';


//Companies service used to communicate Companies REST endpoints
    function Companies($resource) {
        return {
            ById: $resource('api/companies/:company:companyId', {
                company: '@_id',
                companyId: '@_companyId'
            }, {
                update: {
                    method: 'PUT'
                }
            }),
            ByUser: $resource('api/users/:userId/companies', {
                userId: '@_userId'
            }),
            get: function(companyId) {
                var rsrc = $resource('api/companies/:id', {
                    id: '@id'
                });

                return rsrc.get({id: companyId}).$promise;
            },
            getByUser: function(userId) {
                var rsrc = $resource('api/users/:userId/companies', {
                    userId: '@_userId'
                });

                return rsrc.get({userId: userId}).$promise;
            }
        };
    }

    Companies.$inject = ['$resource'];

    angular
        .module('companies')
        .factory('Companies', Companies);
})();
