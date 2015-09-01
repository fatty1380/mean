(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .factory('outsetUsersService', outsetUsersService);

    outsetUsersService.$inject = ['$http', 'settings'];

    function outsetUsersService($http, settings) {
        var users = [];

        function getUsers() {
            return users;
        }

        function setUsers(newUsers) {
            if(!newUsers) return;
            users  = newUsers;
            return users;
        }

        function addUsers(newUsers) {
            if(!newUsers) return;

            if(angular.isArray(newUsers)){
                users = users.contact(newUsers);
            }

            return users;
        }

        function search(query) {
            if(!query) return;
            var url = settings.search + '?text=' + query;
            return $http.get(url);
        }

        return {
            getUsers: getUsers,
            setUsers: setUsers,
            addUsers: addUsers,
            search: search
        }
    }

})();
