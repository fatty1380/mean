(function() {
    'use strict';

    function ProfileShareCtrl(profileData) {
        var vm = this;
        vm.profileData = profileData;
    }

    ProfileShareCtrl.$inject = ['profileData'];

    angular
        .module('account')
        .controller('ProfileShareCtrl', ProfileShareCtrl);

})();
