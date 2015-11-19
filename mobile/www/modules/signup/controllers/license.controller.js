(function () {
    'use strict';

    angular
        .module('signup')
        .controller('LicenseCtrl', LicenseCtrl);

    LicenseCtrl.$inject = ['$state', 'registerService', 'LoadingService'];

    function LicenseCtrl($state, registerService, LoadingService) {

        var vm = this;
        vm.class = null;
        vm.endorsement = endorsementStub;

        vm.header = 'Create Account';
        vm.backTxt = 'Back';
        vm.saveTxt = 'Continue';

        vm.save = save;

        function save() {
            var obj = {
                license: {
                    class: vm.class,
                    endorsements: getEndorsementKeys(vm.endorsement)
                }
            }

            LoadingService.showLoader('please wait');

            registerService.updateUser(obj).then(
                function (response) {
                    if (response.success) {
                        logger.debug("license response update user : ", response);

                        $state.go('signup-trucks');
                        LoadingService.hide();
                    } else {
                        logger.error("license response update user ERROR: ", response);

                        $state.go('login');
                        LoadingService.showFailure('Sorry, unable to save at this time');
                    }
                });
        }


    }

    angular
        .module('signup')
        .controller('ProfileEditLicenseCtrl', LicenseProfileCtrl);

    LicenseProfileCtrl.$inject = ['userService', 'LoadingService'];
    function LicenseProfileCtrl(userService, LoadingService) {
        var vm = this;

        vm.class = null;
        vm.endorsement = endorsementStub;

        vm.header = 'Edit License'
        vm.backTxt = 'Cancel';
        vm.saveTxt = 'Save';
        vm.showCancel = true;

        vm.save = save;
        vm.cancel = vm.cancelModal;

        activate();
        
        /////////////////////////////////////////////////////////////////////////////
        
        function activate() {
            var license = userService.profileData && userService.profileData.license;

            if (!_.isEmpty(license)) {
                vm.class = license.class;
                vm.endorsement = mapEndorsementKeys(license.endorsements);
            }
        }

        function save() {
            var obj = {
                license: {
                    class: vm.class,
                    endorsements: getEndorsementKeys(vm.endorsement)
                }
            }

            LoadingService.showLoader('Saving License');

            userService.updateUserData(obj).then(
                function success(response) {
                    debugger;
                    vm.closeModal(response.license);
                    LoadingService.hide();
                },
                function fail(err) {
                    LoadingService.showFailure('Unable to Save at this time');
                    logger.error(err, 'Failed to update License');
                });
        }
    }
    
    /////////////////////////////////////////////////////////
    
    function getEndorsementKeys(obj) {
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
    
    function mapEndorsementKeys(keys) {
        var endorsements = _.clone(endorsementStub);
        _.each(keys, function (key) {
            debugger;
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
    }
})();
