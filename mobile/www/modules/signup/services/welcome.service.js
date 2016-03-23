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

    welcomeService.$inject = ['modalService', '$q', 'StorageService'];

    function welcomeService(modalService, $q, StorageService) {

        return {
            showModal: showModal,
            initialize: initialize,
            acknowledge: acknowledge,
            isAckd: function(state) { return !!(StorageService.get(state) > 0); }
        };

        // //////////////////////////////////////////////////////

        function initialize(key) {
            if (!!key) {
                StorageService.set(key, 1);

            }
            else {
                _.each(_.keys(screenConfigs), function(key) {
                    if (key === 'account.home') {
                        StorageService.set(key, 2)
                    }
                    else {
                        StorageService.set(key, 1);
                    }
                });
            }
        }

        function acknowledge(key) {
            var viewCount = StorageService.get(key) - 1;
            StorageService.set(key, viewCount);
        }      

        function showModal(state, parameters) {
            var templateUrl = 'modules/account/child_modules/profile/templates/welcome-modal.html';
            var controller = 'WelcomeModalCtrl as vm';

            parameters = parameters || { stateName: state };

            if (state === 'badge.info') {
                var alwaysShow = true;
                templateUrl = 'modules/account/child_modules/profile/templates/badge-info-modal.html';
            }


            var key = parameters.stateName;
            var remainingViews = StorageService.get(key);

            logger.info('Welcome Modal for state %s: %s', key, StorageService.get(key) ? 'yes' : 'no');

            if (!!remainingViews || alwaysShow) {
                return modalService
                    .show(templateUrl, controller, parameters)
                    .then(function (isAckd) {
                        if (isAckd) {
                            var viewCount = StorageService.get(key) - 1;
                            StorageService.set(key, viewCount);
                            return true;
                        }
                        return false;
                    });
            }

            // If back not required, resolve with false;
            return $q.when(false);
        }
    }

    angular
        .module('signup')
        .controller('WelcomeModalCtrl', WelcomeModalCtrl);

    WelcomeModalCtrl.$inject = ['parameters', 'tokenService', '$window', 'settings'];

    function WelcomeModalCtrl (parameters, tokenService, $window, settings) {
        var vm = this;
        var screenConfig = screenConfigs[parameters.stateName];


        // FIX ME - should change to indicator besides true/fasle bool to allow for >2 alternate screens
        vm.template = 'default';

        if (parameters.stateName === 'documents.share') {
            vm.default = 'docShare';
        }

        if (parameters.stateName === 'account.home') {
            vm.template = 'accountHome';
        }


        if (_.isEmpty(screenConfig)) {
            logger.error('Closing modal because of no config');
            return vm.closeModal(false);
        }

        vm.welcomeText = screenConfig.text;
        vm.welcomeTitle = screenConfig.title || 'Welcome';
        vm.subHeader = screenConfig.subHeader || '';
        vm.subHeaderSec = screenConfig.subHeaderSec || '';
        vm.textSec = screenConfig.textSec || '';

        vm.acknowledge = acknowledge;
        vm.goToOrderReports = goToOrderReports;

        // ///////////////////////////////////

        function acknowledge () {
            vm.closeModal(true);
        }

        function goToOrderReports() {
            var refreshToken = tokenService.get('refresh_token') || '';
            var refreshQuery = !!refreshToken ? '?refresh_token=' + refreshToken : '';

            $window.open(settings.baseUrl + 'reports/' + refreshQuery, '_system');
            vm.closeModal('Opened Report Order Page');
        }          
    }

    var screenConfigs = {
        'account.profile': {
            title: 'Your TruckerLine Profile',
            text: 'With your profile you will build and mange your Professional reputation. Be sure to fill out your experience and request reviews from shippers and co-workers. When you’re ready to apply for a job, or pick up a load make sure to share your profile with the interested party to put your best foot forward!'
        },
        'account.profile.reviews': {
            text: 'This is your Reviews Section where you can request reviews from people you have worked with previously. Use reviews as your place to show your professionalism and work ethic in ways that traditional driver reports can’t!'
        },
        'account.lockbox': {
            title: 'Secure Document Lockbox',
            text: 'Welcome to your Secure TruckerLine Document Lockbox. Here you can manage, view and share all of your Professional Documentation by simply scanning it with your smartphone and own your reputation by including your MVR, Background check and Employment Verification right in your profile. This area is secured, and information will never be shared without your consent. '
        },
        'account.activity': {
            title: 'Your Activity Feed',
            text: 'This is your activity feed where you can keep a personal log of your daily drive and see what your industry friends are up to when they post their daily log. Get started and Add your First Activity!'
        },
        'account.messages': {
            title: 'Welcome to your Messages',
            text: 'Use this area to communicate with people you’ve connected with in the Industry and want to stay in touch with!'
        },
        'lockbox.add': {
            title: 'Adding Lockbox Documents',
            text: 'Adding documents to your lockbox is easy. Simply place the document you want to add on a flat, well-list area and take a clear picture, trying to fill up the whole screen. Once you have a good picture, you can select the document type, save it, and it will be waiting securely in your lockbox anytime you need it.'
        },
        'documents.share': {
            title: 'Sending Resume and Docs',
            text: 'Select the Documents you\'d like to email with your Resume, and Securely email them from wherever! Let\'s get started by entering your Lockbox Password...'
        },
        'account.home': {
            title: 'Grow your Convoy!',
            subHeader: 'Daily Updates - ',
            text: 'See what your Friends are Hauling & where they are in the US!',
            subHeaderSec: 'Free MVR Offer - ',
            textSec: 'Invite 5+ Truckers and receive a free MVR for your Lockbox!'
        },
        'badge.info': {
            title: '',
            text: ''
        }
    };

})();
