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

        vm.saveExperience = saveExperience;

        function saveExperience() {
            logger.debug(' ');
            logger.debug('saveExperience()');
            logger.debug(vm.experience);

            experienceService.postUserExperience(vm.experience)
            .then(function (resp) {
                vm.closeModal(resp.data);
                vm.experience = {};
            }, function (err) {
                logger.error('[ProfileAddExperience.save] err --->>>', err);
            });
        }
    }
})();
