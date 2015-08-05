(function() {
    'use strict';

    function ProfileShareCtrl(profileData) {
        var vm = this;
        vm.profileData = profileData;

        vm.documents = [
            {
                name: 'Document',
                date: '3/17/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/13/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/12/2015',
                checked: false
            },
            {
                name: 'Document',
                date: '3/11/2015',
                checked: false
            }
        ]

    }

    ProfileShareCtrl.$inject = ['profileData'];

    angular
        .module('account')
        .controller('ProfileShareCtrl', ProfileShareCtrl);

})();
