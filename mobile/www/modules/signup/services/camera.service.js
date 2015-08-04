(function () {

    function cameraService($q) {
        return {
            getPicture: function(options) {
                var q = $q.defer();
                navigator.camera.getPicture(function(result) {
                    q.resolve(result);
                }, function(err) {
                    q.reject(err);
                }, options);

                return q.promise;
            }
        }
    }

    cameraService.$inject = ['$q'];

    angular
        .module('signup')
        .factory('cameraService', cameraService);
})();
