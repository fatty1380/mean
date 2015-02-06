(function() {
    function RaygunProvider($provide) {
        $provide.decorator("$exceptionHandler", ['$delegate', function($delegate) {
            return function (exception, cause) {
                Raygun.send(exception);
                $delegate(exception, cause);
            }
        }])


        function RaygunHandler($delegate, $log) {
            return function (exception, cause) {
                $log.debug('Sending to Raygun');
                Raygun.send(exception);
                $delegate(exception, cause);
            }
        };

        RaygunHandler.$inject = ['$delegate', '$log'];

        $provide.decorator("$exceptionHandler", RaygunHandler);
    }

    RaygunProvider.$inject = ['$provide'];

    angular.module('core')
        .config(RaygunProvider);



})();
