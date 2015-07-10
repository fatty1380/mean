(function () {
    'use strict';


    //Companies service used to communicate Companies REST endpoints
    function Companies($resource) {
        var rsrc = $resource('api/companies/:id',
            { id: '@_id' },
            {
                update: {
                    method: 'PUT'
                }
            });

        var rsrcUser = $resource('api/users/:userId/companies', {
            userId: '@_userId'
        });

        return {
            ById: rsrc,
            ByUser: rsrcUser,
            get: function (company) {
                var companyId = !!company && company.id || company;
                return rsrc.get({ id: companyId }).$promise;
            },
            getByUser: function (user) {
                var userId = user && user.id || user;
                return rsrcUser.get({ userId: userId }).$promise;
            }
        };
    }

    Companies.$inject = ['$resource'];

    angular
        .module('companies')
        .factory('Companies', Companies);
})();
