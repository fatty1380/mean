(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileAddExperienceCtrl', ProfileAddExperienceCtrl);

    ProfileAddExperienceCtrl.$inject = ['$q', 'experienceService' ];

    function ProfileAddExperienceCtrl($q, experienceService) {
        var vm = this;

        vm.experience = {
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            location: ''
        }

        vm.cancel = cancel;
        vm.saveExperience = saveExperience;

        function saveExperience() {
            console.log(' ');
            console.log('saveExperience()');
            console.log(vm.experience);

            experienceService.postUserExperience(vm.experience)
            .then(function (resp) {
                vm.experience = {};
                console.warn('success --->>>', resp);
                cancel();
            }, function (err) {
                console.warn('err --->>>', err);
            });
        }

        function cancel() {
            vm.closeModal(null);
        }
    }
})();
