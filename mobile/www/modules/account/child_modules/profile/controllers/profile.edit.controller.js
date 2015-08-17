(function() {
    'use strict';

    function ProfileEditCtrl(profileData) {
        var vm = this;
        vm.profileData = profileData;

    }

    ProfileEditCtrl.$inject = ['profileData'];

    angular
        .module('account')
        .controller('ProfileEditCtrl', ProfileEditCtrl);

})();
