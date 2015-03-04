(function () {
    'use strict';

    function RaygunDelegate($delegate, $log) {
        return function (exception, cause) {
            Raygun.send(exception);
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
