(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .filter('monthDate', function () {
            return function (input) {
                if (!input) {
                    return null;
                }

                try {
                    logger.trace('Parsing date from `%s`', input);
                    var d = (new Date(input));

                    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                } catch (err) {
                    logger.error('Unable to parse monthDate: ', err);
                }

                return null;
            };
        });
})();
