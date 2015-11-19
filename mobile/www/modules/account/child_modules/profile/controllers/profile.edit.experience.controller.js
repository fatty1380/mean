(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditExperienceCtrl', ProfileEditExperienceCtrl);

    ProfileEditExperienceCtrl.$inject = ['$q', 'experienceService', 'parameters'];

    function ProfileEditExperienceCtrl($q, experienceService, parameters) {
        var vm = this;
        
        vm.stateAction = 'Edit';

        logger.debug(parameters);

        vm.experience = parameters;

        vm.saveExperience = saveExperience;

        function saveExperience() {
            logger.debug(' ');
            logger.debug('saveExperience()');
            logger.debug(vm.experience);

            experienceService.updateUserExperience(vm.experience._id, vm.experience)
            .then(function (resp) {
                vm.experience = {};
                vm.closeModal(resp.data);
            }, function (err) {
                logger.error('[ProfileEditExperience.saveExperience] err --->>>', err);
            });
        }
    }
})();
