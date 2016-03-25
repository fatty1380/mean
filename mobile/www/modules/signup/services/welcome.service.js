(function () {
    'use strict';

    /**
     * Welcome Service
     * ---------------
     * 1. New User is created - Welcome Service Initialized
     */

    angular
        .module('signup')
        .factory('welcomeService', welcomeService);

    welcomeService.$inject = ['modalService', 'StorageService'];

    function welcomeService (modalService, StorageService) {

        return {
            showModal: showModal,
            initialize: initialize,
            acknowledge: acknowledge,
            isAckd: isAckd
        };

        // //////////////////////////////////////////////////////

        function initialize (key, views, delayDays) {

            // FIX ME - should un-recurse this function
            var viewData = {
                key: key,
                views: views || 1,
                delayDays: delayDays || null
            };

            if (key) {
                return StorageService.set(key, viewData);
            }

            _.each(_.keys(AppConfig.screenConfigs), function (innerKey) {
                initialize(innerKey, AppConfig.screenConfigs[innerKey].views, AppConfig.screenConfigs[innerKey].delayDays);
            });
        }

        function acknowledge (key) {
            return StorageService.get(key)
                .then(function (data) {

                    var modalData = data;
                    modalData.views --;
                    return StorageService.set(key, modalData);
                });
        }

        function showModal (state, parameters) {
            var templateUrl = 'modules/account/child_modules/profile/templates/welcome-modal.html';
            var controller = 'WelcomeModalCtrl as vm';

            parameters = parameters || { stateName: state };
            var key = parameters.stateName;

            return StorageService.get(key)
                .then(function (data) {

                    var modalData = data;

                    if (modalData === null) {
                        return false;
                    }

                    logger.info('Welcome Modal for state %s: %s', key, modalData ? 'yes' : 'no');

                    if (state === 'badge.info') {
                        templateUrl = 'modules/account/child_modules/profile/templates/badge-info-modal.html';
                        modalData.views = 1;
                    }

                    if (state === 'promo.success') {
                        templateUrl = 'modules/account/child_modules/profile/templates/promo-thanks-modal.html';
                        logger.debug('template modal success');
                    }

                    if (!modalData.views) {
                        return false;
                    }

                    if (!_.isEmpty(modalData.noViewBefore) && moment().isBefore(modalData.noViewBefore)) {
                        logger.debug('Modal should not been seen until', modalData.noViewBefore);
                        return false;
                    }

                    return modalService
                        .show(templateUrl, controller, parameters)
                        .then(function (isAcknowledged) {
                            if (isAcknowledged) {
                                modalData.views--;
                                modalData.noViewBefore = moment().add({ days: modalData.delayDays });

                                return StorageService.set(key, modalData)
                                    .then(function () {
                                        return true;
                                    });
                            }
                            return false;
                        });
                });
        }

        // FIX ME - not sure if we need this method...not referenced anywhere else besides `welcome.service`
        // This is used in the activity service, but there was an inconsistent spelling: `isAcked` vs `isAckd`
        function isAckd (key) {
            return StorageService.get(key)
                .then(function (data) {
                    // Fixing null pointer exception:
                    return data && !!data.views;
                });
        }
    }
})();
