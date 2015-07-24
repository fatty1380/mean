(function() {
    'use strict';

    function ProfileCtrl(registerService) {
        var vm = this;
        vm.profileData = {};
        vm.me = function(){
            registerService.me()
                .then(function (response) {
                    if(response.success) {
                        vm.profileData = response.message.data;
                        console.log('-=-=-=-=-=-=-=-=-=-=-=-=- USER  OBJECT =-==--=-=-=-=-=-=-=-=', vm.profileData);
                    }
                });
        };
        vm.me();
    }

    ProfileCtrl.$inject = ['registerService'];

    angular
        .module('account')
        .controller('ProfileCtrl', ProfileCtrl);

})();
