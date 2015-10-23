(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxOrderReportsCtrl', LockboxOrderReportsCtrl);

    LockboxOrderReportsCtrl.$inject = ['$scope', '$window', 'settings', '$ionicLoading', '$timeout', 'API'];

    function LockboxOrderReportsCtrl($scope, $window, settings, $ionicLoading, $timeout, API) {
        var vm = this;
        vm.cancel = cancel;
        vm.orderNow = orderNow;
        vm.remindLater = remindLater;
        vm.sendRequest = sendRequest;

        function cancel(data) {
            vm.closeModal(data);
        }

        function orderNow () {
            $window.open(settings.baseUrl + 'reports', '_system');
            vm.cancel(null);
        }

        function remindLater () {
            vm.sendRequest()
                .then(function (response) {
                    $ionicLoading.show({ template: 'Request Sent', duration: 2000 });

                    vm.closeModal(response);

                }, function (err) {
                    console.error('Unable to request reminder', err);
                    $ionicLoading.show({ template: '<h3>Sorry</h3>Unable to Send Reminder<br> at this time', duration: 2000 });
                });
        }

        function sendRequest() {
            var data = {requestType: 'reportRequest', message: 'Please, remind me later '};

            return API.doRequest(settings.requests, 'POST', data, true);
        }

    }
})();
