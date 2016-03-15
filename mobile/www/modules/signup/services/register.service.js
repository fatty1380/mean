(function () {
    'use strict';

    angular
        .module('signup')
        .factory('registerService', registerService);

    registerService.$inject = ['$q', 'settings', 'API'];
    function registerService ($q, settings, API) {

        var _userData = {
            props: {}
        };

        /**
         * These 8 methods all make calls to the server
         * and return filtered promises (success=true|false}
         */
        var service = {
            registerUser: registerUser,
            signIn: signIn,
            signOut: signOut,
            me: me,
            updateUser: updateUser,
            updateUserProps: updateUserProps,
            getProfiles: getProfiles,
            getProfileById: getProfileById,
            reset: function reset () { _userData = { props: {} }; }
        };

        /**
         * the following object properties make the current user
         * (while being registerd), available to the varous controllers.
         *
         */
        Object.defineProperty(service, 'userProps',
            {
                isEnumerable: true,
                get: function () {
                    return _userData.props;
                }
            });

        Object.defineProperty(service, 'userData',
            {
                isEnumerable: true,
                get: function () {
                    return _userData;
                }
            });

        return service;

        // //////////////////////////////////////////////////////////////

        function registerUser (data, skipHandlers) {
            if (!data) { return $q.reject('No Data'); }
            var req = API.doRequest(settings.signup, 'post', data);

            if (skipHandlers) { return req; }

            return req.then(handleSuccess, handleError);
        }

        function updateUser (data, skipHandlers) {
            if (!data) { return $q.reject('No Data'); }
            var req = API.doRequest(settings.users, 'put', data);

            if (skipHandlers) { return req; }

            return req.then(handleSuccess, handleError);
        }

        function updateUserProps (data, skipHandlers) {
            if (!data) { return $q.reject('No Data'); }
            var req = API.doRequest(settings.usersProps, 'put', data);

            if (skipHandlers) { return req; }

            return req.then(handleSuccess, handleError);
        }

        function signIn (data, skipHandlers) {
            if (!data) { return $q.reject('No Data'); }

            var signinData = {
                'grant_type': 'password',
                'client_id': 'mobile_v0_1',
                'client_secret': 'shenanigans'
            };

            data.username = data.email;
            data['grant_type'] = signinData['grant_type'];
            data['client_id'] = signinData['client_id'];
            data['client_secret'] = signinData['client_secret'];
            var req = API.doRequest(settings.token, 'post', data);

            if (skipHandlers) { return req; }

            return req.then(handleSuccess, handleError);
        }

        function signOut (skipHandlers) {
            var req = API.doRequest(settings.signout, 'get');

            if (skipHandlers) { return req; }

            return req.then(handleSuccess, handleError);
        }

        function me (skipHandlers) {
            var req = API.doRequest(settings.usersProfile, 'get');

            if (skipHandlers) { return req; }

            return req.then(handleSuccess, handleError);
        }

        function getProfiles (skipHandlers) {
            var req = API.doRequest(settings.profiles, 'get');

            if (skipHandlers) { return req; }

            return req.then(handleSuccess, handleError);
        }

        function getProfileById (profileId, skipHandlers) {
            var req = API.doRequest(settings.profiles + profileId, 'get');

            if (skipHandlers) { return req; }

            return req.then(handleSuccess, handleError);
        }

        // //////////////////////////////////////////////////////////////

        function handleSuccess (response) {
            logger.debug('[RegisterSvc] handleSuccess: ', response, response.data);
            if (response.status === 200) {
                return { success: true, message: response };
            }

            if (!!response.status) { logger.error('[RegisterSvc] Unknown Status: ', response.status); }
            return { success: response.status > 200 && response.status < 400, message: response };

        }

        function handleError (response) {
            logger.error('[RegisterSvc] handleError: ', response);
            return { success: false, message: response, title: response.statusText };
        }
    }
})();


