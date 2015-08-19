(function () {
    'use strict';

    var settings = {};

    settings.baseUrl = 'http://outset-d.elasticbeanstalk.com/';

    // controllers
    settings.oauth = settings.baseUrl + 'oauth/';
    settings.api = settings.baseUrl + 'api/';

    settings.auth = settings.api + 'auth/';
    settings.users = settings.api + 'users/';
    settings.profile = settings.api + 'profile/';
    settings.profiles = settings.api + 'profiles/';
    settings.reviews = settings.api + 'reviews/';
    settings.experience = settings.api + 'experience/';
    settings.documents = settings.api + 'documents/';
    settings.messages = settings.api + 'messages/';
    settings.feed = settings.api + 'feed/';

    // endpoints
    settings.signup = settings.oauth + 'signup/';
    settings.token = settings.oauth + 'token/';
    settings.signout = settings.auth + 'signout/';

    settings.usersProfile = settings.users + 'me/';
    settings.usersExperience = settings.usersProfile + 'experience/';

    settings.usersProps = settings.usersProfile + 'props/';

    angular
        .module(AppConfig.appModuleName)
        .constant('settings', settings);
})();
