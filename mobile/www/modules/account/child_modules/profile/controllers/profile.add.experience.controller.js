(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileAddExperienceCtrl', ProfileAddExperienceCtrl);

    ProfileAddExperienceCtrl.$inject = ['$q', 'experienceService' ];

    function ProfileAddExperienceCtrl($q, experienceService) {
        var vm = this;
        
        vm.stateAction = 'Add'

        vm.experience = {
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            location: ''
        };

        vm.cancel = cancel;
        vm.saveExperience = saveExperience;

        function saveExperience() {
            console.log(' ');
            console.log('saveExperience()');
            console.log(vm.experience);

            experienceService.postUserExperience(vm.experience)
            .then(function (resp) {
                cancel(vm.experience);
                vm.experience = {};
            }, function (err) {
                console.warn('err --->>>', err);
            });
        }

        function cancel(exp) {
            vm.closeModal(exp || null);
        }
    }
})();
