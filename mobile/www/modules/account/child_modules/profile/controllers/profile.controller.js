(function() {
    'use strict';

    function ProfileCtrl(profileService) {
        var vm = this;
        vm.profileData = {};
        vm.getProfile = function () {
            profileService
                .getProfile('55a6600d2944b0bd1536414e')
                .then(function (data) {
                    vm.profileData = data;
                });
        };
        vm.getProfile();

    }

    ProfileCtrl.$inject = ['profileService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
