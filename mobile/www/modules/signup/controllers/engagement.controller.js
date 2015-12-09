(function () {
    'use strict';

    angular
        .module('signup')
        .controller('EngagementCtrl', EngagementCtrl)

    EngagementCtrl.$inject = ['$scope', '$state', '$cordovaGoogleAnalytics', 'userService', 'avatarService', 'LoadingService'];

    function EngagementCtrl($scope, $state, $cordovaGoogleAnalytics, userService, avatarService, LoadingService) {

        var vm = this;

        vm.handle = '';
        vm.userProps = {
            started: '',
            company: '',
            avatar: null,
            owner: null
        }

        vm.initEngagementForm = initEngagementForm;
        vm.continue = continueToLicense;

        function initEngagementForm(scope) {
            vm.form = scope;
        }

        /**
         * Load User Data
         * ---------------
         * Load the user's profile data from the server and extend the 
         * local profile object.
         */
        userService.getUserData().then(
            function success(userData) {
                vm.profileData = userData;

                if (!vm.profileData.props) {
                    vm.profileData.props = {};
                }

                _.extend(vm.userProps, vm.profileData.props);
                
                // if (/\d{4}\-\d{2}/.test(vm.userProps.started)) {
                //     vm.userProps.started = vm.createStartedDateObject(vm.userProps.started);
                // }

                vm.handle = vm.profileData.handle;
            });


        vm.createStartedDateObject = function (started) {
            if (!started) return null;
            var startedArray = started.split('-');

            var year = startedArray[0];
            var month = parseInt(startedArray[1]) - 1;

            return new Date(year, month);
        };
        
        

        /**
         * showEditAvatar
         * --------------
         * Opens an action sheet which leads to either taking
         * a photo, or selecting from device photos.
         */
        vm.showEditAvatar = function (parameters) {
            $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'editAvatar');
            var then = Date.now();
            
            

            avatarService.getNewAvatar(parameters, vm.profileData)
                .then(function processNewAvatar(avatarResult) {
                    if (_.isEmpty(avatarResult)) {
                        $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'engagement', 'newAvatar:cancel');
                        return;
                    }

                    $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'newAvatar');
                    if (vm.userProps.avatar !== avatarResult) {
                        vm.userProps.avatar = avatarResult;
                    }
                    $cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'engagement', 'newAvatar:saved');

                });
        };

        function continueToLicense() {

            var then = Date.now();
            LoadingService.showLoader('Saving');
            
        // Set standard Properties
        var userProps = {
            owner: vm.userProps.owner,
            started: vm.createStartedDateObject(vm.userProps.started),
            //avatar: avatarService.getImage(),
            company: vm.userProps.company
        }
            
        // Events for Props: 
        if (userProps.owner !== null) { $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'setOwner'); }
        if (!!userProps.started) { $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'setStarted'); }
        if (!!userProps.handle) { $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'setHandle'); }
        if (!!userProps.company) { $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'setCompany'); }

        userService.updateUserProps(userProps)
            .then(function success(propsResult) {
                logger.debug('Updated User Props ...', propsResult);
                $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'saveProps');

                return userService.updateUserData({ handle: vm.handle });
            })
            .then(function success(result) {
                // TODO: Check for success/fail
                logger.debug('Saved changes to user', result);
                $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'save', Date.now() - then);

                LoadingService.hide();
                $state.go('signup.license');
            })
            .catch(function failure(err) {
                logger.error('Unable to save changes to user: %o', userProps, err);
                $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'error');
                
                LoadingService.showFailuer('Unable to save changes');
            });

    }
}

})();
