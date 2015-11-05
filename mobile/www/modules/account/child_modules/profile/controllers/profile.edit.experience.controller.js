(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditExperienceCtrl', ProfileEditExperienceCtrl);

    ProfileEditExperienceCtrl.$inject = ['$q', 'experienceService', 'parameters'];

    function ProfileEditExperienceCtrl($q, experienceService, parameters) {
        var vm = this;
        
        vm.stateAction = 'Edit';

        console.log(parameters);

        vm.experience = parameters;

        vm.saveExperience = saveExperience;

        function saveExperience() {
            console.log(' ');
            console.log('saveExperience()');
            console.log(vm.experience);

            experienceService.updateUserExperience(vm.experience._id, vm.experience)
            .then(function (resp) {
                vm.experience = {};
                vm.closeModal(resp.data);
            }, function (err) {
                console.error('err --->>>', err);
            });
        }
    }
})();
