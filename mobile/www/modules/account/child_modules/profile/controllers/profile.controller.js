(function() {
    'use strict';

    function ProfileCtrl(profileService) {
        var vm = this;
        vm.profileData = {};

        profileService.getProfileByID('55a6600d2944b0bd1536414e')
            .then(function (data) {
                vm.profileData = data;
                console.log(vm.profileData);
            });

    }

    ProfileCtrl.$inject = ['profileService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
