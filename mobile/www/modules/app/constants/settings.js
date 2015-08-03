(function () {
    'use strict';

    var settings = {};

    settings.api = 'http://outset-d.elasticbeanstalk.com/';

    settings.profile = settings.api + 'profile/';
    settings.reviews = settings.api + 'reviews/';

    angular
        .module(AppConfig.appModuleName)
        .constant('settings', settings);
})();
