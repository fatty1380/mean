(function () {
    'use strict';

    function RaygunDelegate($delegate, $log) {
        return function (exception, cause) {
            if (!/localhost/i.test(exception.sourceURL+exception.fileName+exception.stack)) {
                debugger;
                Raygun.send(exception);
                $log.debug('sent exception to Raygun');
            }
            $delegate(exception, cause);
        };
    }

    function RaygunProvider($provide) {
        $provide.decorator('$exceptionHandler', RaygunDelegate);
        console.log('completed initialization of Raygun Provider(s)');
    }

    RaygunDelegate.$inject = ['$delegate', '$log'];
    RaygunProvider.$inject = ['$provide'];

    angular.module('core')
        .config(RaygunProvider);


})();
