/*
(function () {
    'use strict';

    var registerService = function ($http) {
        var registerData = {},

            registerUser = function (data) {
                if (!data) return;
                var url = 'http://outset-shadow.elasticbeanstalk.com/api/auth/signup';
                $http
                    .post(url, data)
                    .success(function (response) {
                        registerData = response;
                        return registerData;
                    });
            }

        return{
            registerUser: registerUser(data),
            registerData: registerData
        }
    };

    registerService.$inject = ['$http'];

    angular
        .module('services')
        .factory('registerService', registerService);

})();

*/
