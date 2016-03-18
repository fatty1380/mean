/* global logger */
(function () {
    'use strict';

    angular
        .module('profile')
        .directive('tlineExperienceList', tlineExperienceList);

    tlineExperienceList.$inject = [];
    function tlineExperienceList () {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            bindToController: true,
            templateUrl: 'modules/account/child_modules/profile/templates/experience-list.mobile.html',
            controller: ExperienceListController,
            controllerAs: 'dm',
            link: link,
            restrict: 'E',
            scope: {
                experience: '=ngModel',
                // profile: '=?',
                showAddBtn: '=showAddButton',
                canEdit: '=',
                showCompact: '=',
                instructText: '=',
                showAddExperienceModal: '=showAddFn'
            }
        };
        return directive;

        function link (scope, element, attrs) {
            scope.dm.activate();
        }
    }
    /* @ngInject */

    ExperienceListController.$inject = ['$cordovaGoogleAnalytics', 'profileModalsService', 'experienceService'];
    function ExperienceListController ($cordovaGoogleAnalytics, profileModalsService, experienceService) {
        var dm = this;

        dm.activate = activate;

        // ///////////////////////////////////////////////////////////////////////////////

        function activate () {
            if (dm.canEdit) {
                getExperience();
            }

            if (dm.canEdit) {
                dm.showAddExperienceModal = showAddExperienceModal;
                dm.showEditExperienceModal = showEditExperienceModal;
            }
        }

        function showAddExperienceModal (parameters) {
            $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'addExperience');
            profileModalsService
                .showAddExperienceModal(parameters)
                .then(function (experienceResult) {
                    if (_.isEmpty(experienceResult)) {
                        return;
                    }

                    if (_.isArray(experienceResult)) {
                        dm.experience = experienceResult;
                    } else {
                        dm.experience.push(experienceResult);
                    }
                })
                .catch(function (err) {
                    if (!!err) { logger.debug(err); }
                });
        }

        function showEditExperienceModal (experienceItem) {
            $cordovaGoogleAnalytics.trackEvent('Profile', 'main', 'editExperience');
            profileModalsService
                .showEditExperienceModal(experienceItem)
                .then(function (experienceResult) {
                    logger.debug('Edited Experience ', experienceResult);

                    if (_.isArray(experienceResult)) {
                        dm.experience = experienceResult;
                    }
                    else {
                        dm.experience.push(experienceResult);
                    }

                    // experienceItem = result;
                    getExperience();
                })
                .catch(function (err) {
                    if (!!err) { logger.debug(err); }
                });
        }



        function getExperience () {
            experienceService
                .getUserExperience()
                .then(function (response) {
                    dm.experience = response.data || [];
                });
        }
    }
})();
