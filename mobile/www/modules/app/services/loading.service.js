(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .factory('LoadingService', LoadingService);

    LoadingService.$inject = ['$ionicLoading', 'userService'];

    function LoadingService ($ionicLoading, userService) {

        var spinner = '<ion-spinner class="spinner-stable"></ion-spinner>';
        var success = '<i class="icon ion-checkmark"></i>';
        var failure = '<i class="icon ion-close"></i>';
        var alert = '<i class="icon ion-alert"></i>';

        var ld = { duration: 20000, delay: 250, template: spinner };
        var sd = { duration: 2000, template: success };
        var fd = { duration: 2000, template: failure };
        var dd = { duration: 2000 };

        return {
            showLoader: function (text, options) {
                var template = {
                    template: spinner + (!!text ? '<h4>' + text + '</h4>' : '')
                };
                options = _.extend({}, ld, template, options);

                return $ionicLoading.show(options);
            },
            showSuccess: function (text, options) {
                var template = {
                    template: success + (!!text ? '<h4>' + text + '</h4>' : '')
                };
                options = _.extend({}, sd, template, options);

                return $ionicLoading.show(options);
            },
            showFailure: function (text, options) {
                text = text || 'Sorry, an error occurred';
                var template = {
                    template: failure + '<h4>' + text + '</h4>'
                };
                options = _.extend({}, fd, template, options);

                return $ionicLoading.show(options);
            },
            showAlert: function (text, options) {
                var template = {
                    template: alert + (!!text ? '<h4>' + text + '</h4>' : '')
                };
                options = _.extend({}, dd, template, options);

                return $ionicLoading.show(options);
            },
            showIcon: function (text, icon, options) {
                var template = {
                    template: '<i class="icon ' + icon + '"></i>'
                    + (!!text ? '<h4>' + text + '</h4>' : '')
                };
                options = _.extend({}, dd, template, { duration: 1300 }, options);

                return $ionicLoading.show(options);
            },
            show: function (text, options) {
                options = options || _.isObject(text) && text || {};

                var template = {
                    template: text || success
                };
                options = _.extend({}, dd, template, options);

                return $ionicLoading.show(options);
            },


            hide: function () {
                return $ionicLoading.hide();
            }
        };
    }
})();

