/* global angular */
(function () {
    'use strict';

    angular
        .module('signup')
        .controller('LicenseCtrl', LicenseCtrl);

    LicenseCtrl.$inject = ['$state', '$cordovaGoogleAnalytics', '$ionicHistory', 'userService', 'LoadingService'];

    function LicenseCtrl ($state, $cordovaGoogleAnalytics, $ionicHistory, userService, LoadingService) {

        var vm = this;
        vm.class = null;
        vm.endorsement = endorsementStub;

        // vm.backTxt = 'Back';
        vm.saveTxt = 'Continue';
        vm.canGoBack = false;

        vm.save = save;
        vm.cancel = goBack;

        function save () {
            var obj = {
                license: {
                    class: vm.class,
                    endorsements: getEndorsementKeys(vm.endorsement)
                }
            };

            var then = Date.now();

            LoadingService.showLoader('please wait');

            userService.updateUserData(obj).then(
                function success (response) {
                    $cordovaGoogleAnalytics.trackEvent('signup', 'license', 'save');
                    $cordovaGoogleAnalytics.trackEvent('signup', Date.now() - then, 'license', 'save');

                    $state.go('signup.engagement');
                    LoadingService.hide();
                })
                .catch(function fail (err) {
                    logger.error('license response update user ERROR: ', err);
                    $cordovaGoogleAnalytics.trackEvent('signup', 'license', 'error');

                    LoadingService.showFailure('Sorry, unable to save at this time');
                });
        }

        function goBack () {
            return null;
        }
    }

    angular
        .module('signup')
        .controller('ProfileEditLicenseCtrl', LicenseProfileCtrl);

    LicenseProfileCtrl.$inject = ['$cordovaGoogleAnalytics', 'userService', 'LoadingService'];
    function LicenseProfileCtrl ($cordovaGoogleAnalytics, userService, LoadingService) {
        var vm = this;

        vm.class = null;
        vm.endorsement = endorsementStub;

        vm.header = 'Edit License';
        vm.backTxt = 'Cancel';
        vm.saveTxt = 'Save';
        vm.showCancel = true;
        vm.canGoBack = true;

        vm.save = save;
        vm.cancel = function () { vm.cancelModal(); };

        activate();

        // ///////////////////////////////////////////////////////////////////////////

        function activate () {
            var license = userService.profileData && userService.profileData.license;

            if (!_.isEmpty(license)) {
                vm.class = license.class;
                vm.endorsement = mapEndorsementKeys(license.endorsements);
            }
        }

        function save () {
            var obj = {
                license: {
                    class: vm.class,
                    endorsements: getEndorsementKeys(vm.endorsement)
                }
            };
            var then = Date.now();

            LoadingService.showLoader('Saving License');

            userService.updateUserData(obj).then(
                function success (response) {
                    $cordovaGoogleAnalytics.trackEvent('profile', 'license', 'save');
                    $cordovaGoogleAnalytics.trackTiming('profile', Date.now() - then, 'license', 'save');

                    vm.closeModal(response.license);
                    LoadingService.hide();
                })
                .catch(function fail (err) {
                    LoadingService.showFailure('Unable to Save at this time');
                    $cordovaGoogleAnalytics.trackEvent('profile', 'license', 'error');

                    logger.error(err, 'Failed to update License');
                });
        }
    }

    // ///////////////////////////////////////////////////////

    function getEndorsementKeys (obj) {
        var keys = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i]) {
                    keys.push(i);
                }
            }
        }
        return keys;
    }

    function mapEndorsementKeys (keys) {
        var endorsements = _.clone(endorsementStub);
        _.each(keys, function (key) {
            endorsements[key] = true;
        });

        return endorsements;
    }

    var endorsementStub = {
        T: false,
        P: false,
        S: false,
        N: false,
        H: false,
        X: false
    };
})();
