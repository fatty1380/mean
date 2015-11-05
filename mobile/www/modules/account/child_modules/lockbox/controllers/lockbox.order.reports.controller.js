(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxOrderReportsCtrl', LockboxOrderReportsCtrl);

    LockboxOrderReportsCtrl.$inject = ['$window', 'settings', '$ionicLoading', 'API'];

    function LockboxOrderReportsCtrl($window, settings, $ionicLoading, API) {
        var vm = this;
        vm.orderNow = orderNow;
        vm.remindLater = remindLater;
        vm.sendRequest = sendRequest;

        function orderNow () {
            $window.open(settings.baseUrl + 'reports/', '_system');
            vm.closeModal('Opened Report Order Page');
        }

        function remindLater () {
            vm.sendRequest()
                .then(function (response) {
                    $ionicLoading.show({ template: 'Reminder Sent', duration: 2000 });

                    vm.closeModal(response);

                }, function (err) {
                    console.error('Unable to request reminder', err);
                    $ionicLoading.show({ template: '<h3>Sorry</h3>Unable to Send Reminder<br> at this time', duration: 2000 });
                });
        }

        function sendRequest() {
            var data = {requestType: 'reportRequest', message: 'Please, remind me later '};

            return API.doRequest(settings.requests, 'POST', data);
        }

    }
})();
