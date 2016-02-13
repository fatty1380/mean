(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxOrderReportsCtrl', LockboxOrderReportsCtrl);

    LockboxOrderReportsCtrl.$inject = ['$window', 'settings', 'LoadingService', 'tokenService', 'API'];

    function LockboxOrderReportsCtrl ($window, settings, LoadingService, tokenService, API) {
        var vm = this;
        vm.orderNow = orderNow;
        vm.remindLater = remindLater;
        vm.sendRequest = sendRequest;

        function orderNow () {
            var refreshToken = tokenService.get('refresh_token') || '';
            var refreshQuery = !!refreshToken ? '?refresh_token=' + refreshToken : '';

            $window.open(settings.baseUrl + 'reports/' + refreshQuery, '_system');
            vm.closeModal('Opened Report Order Page');
        }

        function remindLater () {
            vm.sendRequest()
                .then(function (response) {
                    LoadingService.showSuccess('Reminder Sent');

                    vm.closeModal(response);

                }, function (err) {
                    logger.error('Unable to request reminder', err);
                    LoadingService.showFailure('Sorry, Unable to Send Reminder');
                });
        }

        function sendRequest () {
            var data = { requestType: 'reportRequest', message: 'Please, remind me later ' };

            return API.doRequest(settings.requests, 'POST', data);
        }

    }
})();
