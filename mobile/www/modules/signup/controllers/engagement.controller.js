(function () {
    'use strict';

    angular
        .module('signup')
        .controller('EngagementCtrl', EngagementCtrl)

    EngagementCtrl.$inject = ['$scope', '$state', '$cordovaGoogleAnalytics', 'registerService', 'cameraService', 'userService', 'avatarService'];

    function EngagementCtrl($scope, $state, $cordovaGoogleAnalytics, registerService, cameraService, userService, avatarService) {

        var vm = this;
        vm.handle = '';
        vm.started = '';
        vm.company = '';
        vm.owner = null;
        vm.camera = cameraService;

        vm.initEngagementForm = initEngagementForm;
        vm.continueToLicense = continueToLicense;

        function initEngagementForm(scope) {
            vm.form = scope;
        }

								// Code removed in favor of promise returned by 'getNewAvatar' below
        // //update avatar after change data
        // $scope.$watch(
        //     function () {
        //         return userService.profileData;
        //     },
        //     function () {
        //         vm.profileData = userService.profileData;
        //     },
        //     true);


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
                    if (vm.profileData.props.avatar !== avatarResult) {
                        debugger;
                        vm.profileData.props.avatar = avatarResult;
                    }
																				$cordovaGoogleAnalytics.trackTiming('signup', Date.now() - then, 'engagement', 'newAvatar:saved');

                });
        };

        function continueToLicense() {
            // Set Owner/Operator Status if set. This is to support trinary selection : null/true/false
            if (vm.owner !== null) {
                registerService.userProps.owner = vm.owner;
                $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'setOwner');
            }
            var then = Date.now();
            
            // Set standard Properties
            registerService.userProps.started = vm.createStartedDateObject(vm.started);
            registerService.userProps.avatar = avatarService.getImage();
            registerService.userProps.company = vm.company;
            
            // Events for Props: 
            if (!!vm.started) { $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'setStarted'); }
            if (!!vm.handle) { $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'setHandle'); }
            if (!!vm.company) { $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'setCompany'); }

            registerService.updateUserProps(registerService.userProps)
                .then(function success(propsResult) {
                    logger.debug('Updated User Props ...', propsResult);
                    // TODO: Check for success/fail
                   
                    $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'saveProps');

                    registerService.userData.handle = vm.handle;
                    return registerService.updateUser({ handle: vm.handle });
                })
                .then(function success(result) {
                    // TODO: Check for success/fail
                    logger.debug('Saved changes to user', result);
                    $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'save', Date.now()-then);

                    $state.go('signup-license');
                })
                .catch(function failure(err) {
                    logger.error('Unable to save changes to user', registerService.userData, err);
                    $cordovaGoogleAnalytics.trackEvent('signup', 'engagement', 'error');
                    vm.error = 'Unable to save changes';
                });

        }
    }

})();
