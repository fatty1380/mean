'use strict';

//Companies service used to communicate Companies REST endpoints
function Companies($resource) {
    return $resource('companies/:companyId', {
        companyId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}


function ProfileCompanies($resource) {
    return $resource('profiles/:userId/companies', {
        userId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}

Companies.$inject = ['$resource'];
ProfileCompanies.$inject = ['$resource'];

angular
    .module('companies')
    .factory('Companies', Companies)
    .factory('Profile.Companies', ProfileCompanies);
