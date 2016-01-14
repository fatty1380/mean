/* global logger */
(function () {
    'use strict';

    angular
        .module('profile')
        .directive('tlineExperienceList', tlineExperienceList);

    tlineExperienceList.$inject = [];
    function tlineExperienceList() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            templateUrl: '/modules/account/child_modules/profile/templates/experience-list.mobile.html',
            controller: ExperienceListController,
            controllerAs: 'vm',
            link: link,
            restrict: 'E',
            scope: {
                experience: '=ngModel',
                //profile: '=?',
                showAddBtn: '=showAddButton',
                canEdit: '=',
                instructText: '=',
                showAddExperienceModal: '=showAddFn'
            }
        };
        return directive;

        function link(scope, element, attrs) {
            scope.vm.activate();
        }
    }
    /* @ngInject */

    ExperienceListController.$inject = ['$cordovaGoogleAnalytics', 'profileModalsService', 'experienceService'];
    function ExperienceListController($cordovaGoogleAnalytics, profileModalsService, experienceService) {
        var vm = this;

        vm.activate = activate;

        if (vm.canEdit) {
            vm.showAddExperienceModal = showAddExperienceModal;
            vm.showEditExperienceModal = showEditExperienceModal;
        }

        /////////////////////////////////////////////////////////////////////////////////

        function activate() {
            if (vm.canEdit) {
                getExperience();
            }
        }

        function showAddExperienceModal(parameters) {
            $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'addExperience');
            profileModalsService
                .showAddExperienceModal(parameters)
                .then(function (experienceResult) {
                    if (_.isEmpty(experienceResult)) {
                        return;
                    }

                    if (_.isArray(experienceResult)) {
                        vm.experience = experienceResult;
                    } else {
                        vm.experience.push(experienceResult);
                    }
                })
                .catch(function (err) {
                    if (!!err) { logger.debug(err); }
                });
        }

        function showEditExperienceModal(experienceItem) {
            $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'editExperience');
            profileModalsService
                .showEditExperienceModal(experienceItem)
                .then(function (experienceResult) {
                    logger.debug('Edited Experience ', experienceResult);

                    if (_.isArray(experienceResult)) {
                        vm.experience = experienceResult;
                    } else {
                        vm.experience.push(experienceResult);
                    }
                        
                    //experienceItem = result;
                    getExperience();
                })
                .catch(function (err) {
                    if (!!err) { logger.debug(err); }
                });
        }



        function getExperience() {
            experienceService
                .getUserExperience()
                .then(function (response) {
                    vm.experience = response.data || [];
                });
        }
    }
})();