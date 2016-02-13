(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditExperienceCtrl', ProfileEditExperienceCtrl);

    ProfileEditExperienceCtrl.$inject = ['$q', '$filter', '$ionicPopup', 'experienceService', 'parameters'];

    function ProfileEditExperienceCtrl ($q, $filter, $ionicPopup, experienceService, parameters) {
        var vm = this;

        vm.stateAction = 'Edit';

        logger.debug(parameters);

        vm.experience = parameters;

        if (!!vm.experience) {
            vm.startDate = getFormattedDate(vm.experience.startDate);
            vm.endDate = getFormattedDate(vm.experience.endDate);
        }

        vm.saveExperience = saveExperience;
        vm.deleteExperience = deleteExperience;

        function saveExperience () {
            logger.debug(' ');
            logger.debug('saveExperience()');
            logger.debug(vm.experience);

            if (/\d{4,4}-\d{2,2}/.test(vm.startDate)) {
                vm.experience.startDate = vm.startDate;
            } else if (_.isEmpty(vm.startDate)) {
                vm.experience.startDate = null;
            }

            if (/\d{4,4}-\d{2,2}/.test(vm.endDate)) {
                vm.experience.endDate = vm.endDate;
            } else if (_.isEmpty(vm.endDate)) {
                vm.experience.endDate = null;
            }

            experienceService.updateUserExperience(vm.experience._id, vm.experience)
                .then(function (resp) {
                    vm.experience = {};
                    vm.closeModal(resp.data);
                }, function (err) {
                    logger.error('[ProfileEditExperience.saveExperience] err --->>>', err);
                });
        }

        function deleteExperience () {
            return $ionicPopup
                .confirm({
                    template: 'This will permanently delete this experience from your profile',
                    title: 'Remove Experience?',
                    okText: 'Remove',
                    okType: 'button-assertive'
                })
                .then(function (res) {
                    if (!!res) {
                        return experienceService.deleteUserExperience(vm.experience._id);
                    }

                    return $q.reject('Deletion Canceled');
                })
                .then(function (deleted) {
                    logger.debug('Experience Deleted', deleted);

                    vm.closeModal(null);
                });
        }

        function getFormattedDate (date) {
            return $filter('date')($filter('monthDate')(date), 'MMMM, yyyy');
        }
    }
})();
