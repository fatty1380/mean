(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileExperienceListCtrl', ProfileExperienceListCtrl);

    ProfileExperienceListCtrl.$inject = ['$q', 'experienceService', 'parameters'];

    function ProfileExperienceListCtrl ($q, experienceService, parameters) {
        var vm = this;

        logger.debug(parameters);

        vm.experience = parameters.experience;
        vm.instructText = parameters.instructText;

        // Connected to the function within the directive
        vm.addExperience = null;

        vm.save = save;

        function save () {
            // doesn't really save
            vm.closeModal(vm.experience);
        }
    }
})();
