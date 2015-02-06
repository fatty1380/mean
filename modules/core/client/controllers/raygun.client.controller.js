(function () {
    function RaygunProvider($provide) {
        $provide.decorator("$exceptionHandler",
            ['$delegate', '$log',
                function ($delegate, $log) {
                    return function (exception, cause) {
                        debugger;
                        $log.debug('Sending exception to Raygun');
                        Raygun.send(exception);
                        $delegate(exception, cause);
                    }
                }])
    }

    RaygunProvider.$inject = ['$provide'];

    angular.module('core')
        .config(RaygunProvider);


})();
