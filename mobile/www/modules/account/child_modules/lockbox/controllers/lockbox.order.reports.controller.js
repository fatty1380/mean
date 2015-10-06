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
            $scope.closeModal(data);
        }

        function orderNow () {
            $window.open(settings.baseUrl + 'reports', '_system');
            vm.cancel(null);
        }

        function remindLater () {
            vm.sendRequest()
                .then(function (response) {
                    console.warn('Order reports remind later response --->>>', response);
                    $ionicLoading.show({template: 'Request Sent'});

                    $timeout(function () {
                        $ionicLoading.hide();
                        vm.cancel(null);
                    }, 2000);

                }, function () {
                    vm.cancel(null);
                });
        }

        function sendRequest() {
            var data = {requestType: 'reportRequest', message: 'Please, remind me later '};

            return API.doRequest(settings.requests, 'POST', data, true);
        }

    }
})();
