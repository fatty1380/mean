(function () {
    function RaygunProvider($provide) {
        $provide.decorator('$exceptionHandler',
            ['$delegate', function ($delegate) {
                return function (exception, cause) {
                    Raygun.send(exception);
                    $delegate(exception, cause);
                }
            }]);

        $provide.decorator('$exceptionHandler',
            ['$delegate', '$log',
                function ($delegate, $log) {
                    return function (exception, cause) {
                        $log.debug('Sending exception to Raygun');
                        Raygun.send(exception);
                        $delegate(exception, cause);
                    }
                }]);

        console.log('completed initialization of Raygun Provider(s)')
    }

    RaygunProvider.$inject = ['$provide'];

    angular.module('core')
        .config(RaygunProvider);


})();
