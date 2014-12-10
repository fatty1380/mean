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
        })
    };
}

Companies.$inject = ['$resource'];

angular
    .module('companies')
    .factory('Companies', Companies);
