(function() {
    'use strict';

    angular
        .module('signup')
        .controller('WelcomeModalCtrl', WelcomeModalCtrl);

    WelcomeModalCtrl.$inject = ['parameters', 'tokenService', '$window', 'settings'];

    function WelcomeModalCtrl (parameters, tokenService, $window, settings) {
        var vm = this;
        var screenConfig = AppConfig.screenConfigs[parameters.stateName];

        vm.template = 'default';

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

        vm.promoCode = parameters.promoCode || 'This should be the promocode';

        // ///////////////////////////////////

        function acknowledge () {
            vm.closeModal(true);
        }

        function goToOrderReports () {
            var refreshToken = tokenService.get('refresh_token') || '';
            var refreshQuery = !!refreshToken ? '?refresh_token=' + refreshToken : '';

            $window.open(settings.baseUrl + 'reports/' + refreshQuery, '_system');
            vm.closeModal('Opened Report Order Page');
        }
    }
})();