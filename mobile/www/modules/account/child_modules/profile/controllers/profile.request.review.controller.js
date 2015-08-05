(function() {
    'use strict';

    function ProfileRequestReviewCtrl(profileData) {
        var vm = this;
        vm.profileData = profileData;

    }

    ProfileRequestReviewCtrl.$inject = ['profileData'];

    angular
        .module('account')
        .controller('ProfileRequestReviewCtrl', ProfileRequestReviewCtrl);

})();
