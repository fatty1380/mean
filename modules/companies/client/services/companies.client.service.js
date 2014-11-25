'use strict';

//Companies service used to communicate Companies REST endpoints
function Companies($resource) {
    return {
        ById: $resource('api/companies/:companyId', {
            companyId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        }),
        ByUser: $resource('api/users/:userId/companies', {
            userId: '@_id'
        })
    };
}

Companies.$inject = ['$resource'];

angular
    .module('companies')
    .factory('Companies', Companies);
