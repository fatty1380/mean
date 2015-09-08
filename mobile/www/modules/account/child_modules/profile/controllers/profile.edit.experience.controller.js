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

        vm.cancel = cancel;
        vm.saveExperience = saveExperience;

        function saveExperience() {
            console.log(' ');
            console.log('saveExperience()');
            console.log(vm.experience);

            experienceService.updateUserExperience(vm.experience._id, vm.experience)
            .then(function (resp) {
                vm.experience = {};
                console.warn('success --->>>', resp);
                cancel();
            }, function (err) {
                console.error('err --->>>', err);
            });
        }

        function cancel() {
            vm.closeModal(null);
        }
    }
})();
