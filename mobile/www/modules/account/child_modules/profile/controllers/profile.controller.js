(function() {
    'use strict';

    function ProfileCtrl($state, profileService) {
        var vm = this;

        console.log(profileService);
        console.log($state.current.name);

    }

    ProfileCtrl.$inject = ['$state', 'profileService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
