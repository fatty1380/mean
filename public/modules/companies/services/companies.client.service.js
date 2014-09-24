'use strict';

//Companies service used to communicate Companies REST endpoints
angular.module('companies').factory('Companies', ['$resource',
    function($resource) {
        return $resource('companies/:companyId', {
            companyId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);


angular.module('companies').factory('ProfileCompanies', ['$resource',
    function($resource) {
        return $resource('profiles/:userId/companies', {
            userId: '@_id'
        }, {
            // TODO : See if this can be eliminated?
            update: {
                method: 'PUT'
            }
        });
    }
]);
