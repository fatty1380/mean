(function () {

    angular
        .module('signup')
        .factory('tokenService', tokenService);

    tokenService.$inject = ['$window'];

    function tokenService($window) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            }
        }
    }
})();

(function () {

    angular
        .module('signup')
        .factory('StorageService', StorageService);

    StorageService.$inject = ['$window', 'userService'];

    function StorageService($window, userService) {
        return {
            set: function (key, value, id) {
                $window.localStorage[id || userService.userId + '.' + key] = value;
            },
            get: function(key, defaultValue, id) {
                return $window.localStorage[id || userService.userId + '.' + key] || defaultValue || null;
            },
            remove: function (key, id) {
                return $window.localStorage.removeItem(id || userService.userId + '.' + key);
            }
        }
    }
})();


(function () {

    angular
        .module('signup')
        .factory('LoadingService', LoadingService);

    LoadingService.$inject = ['$ionicLoading', 'userService'];

    function LoadingService($ionicLoading, userService) {
        
        var spinner = '<ion-spinner></ion-spinner>';
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
                    template: spinner + (!!text ? '<br><p>' + text + '</p>' : '')
                };
                options = _.defaults(ld, template, options);
                
                return $ionicLoading.show(options);
            },
            showSuccess: function (text, options) {
                var template = { 
                    template: success + (!!text ? '<br><p>' + text + '</p>' : '')
                };
                options = _.defaults(sd, template, options);
                
                return $ionicLoading.show(options);
            },
            showFailure: function (text, options) {
                var template = { 
                    template: failure + (!!text ? '<br><p>' + text + '</p>' : 'Sorry, an error occurred')
                };
                options = _.defaults(fd, template, options);
                
                return $ionicLoading.show(options);
            },
            showAlert: function (text, options) {
                var template = { 
                    template: alert + (!!text ? '<br><p>' + text + '</p>' : '')
                };
                options = _.defaults(dd, template, options);
                
                return $ionicLoading.show(options);
            },
            showIcon: function (text, icon, options) {
                var template = { 
                    template: '<i class="icon ' + icon + '"></i>'
                    + (!!text ? '<br><p>' + text + '</p>' : '')
                };
                options = _.defaults(dd, template, { duration: 1300 }, options);
                
                return $ionicLoading.show(options);
            },
            show: function (text, options) {
                options = options || _.isObject(text) && text || {};
                
                var template = { 
                    template: text || success
                };
                options = _.defaults(dd, template, options);
                
                return $ionicLoading.show(options);
            },
            
            
            hide: function () {
                return $ionicLoading.hide();
            }
        }
    }
})();

