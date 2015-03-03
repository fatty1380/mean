(function () {
    'use strict';

    function SubscriptionInfoDirective() {
        var ddo = {
            restrict: 'E',
            templateUrl: '/modules/companies/views/templates/subscriptions.client.template.html',
            scope: {
                text: '=?',
                user: '=?',
                companyId: '=?'
            },
            controller: 'SubscriptionInfoController',
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    var defaults = {
        sub: 'Choose from one of the following packages:',
        features: ['Job Posts', 'Applicant Redirect', 'Applicant Tracking', 'Downloadable Reports', 'Require Reports', 'Multiple Log-ins', 'Customized Background Checks'],
    };

    function SubscriptionInfoController(AppConfig, $state, $log) {
        var vm = this;

        AppConfig.getAsync('subscriptions').then(
            function (success) {
                vm.packages = success.packages;
                vm.features = success.features;
            },
            function (error) {
                $log.error('Failed to get packages from server, using local', error);
                vm.packages = defaults.packages;
                vm.features = defaults.features;
            }
        );

        debugger;
        vm.text = _.defaults(vm.text || {}, defaults);


        vm.orderSubscription = function (planId) {
            if (!!planId) {
                $state.go('subscriptionPayment', {'planId': planId, promo: vm.promoCode});
            }
            else {
                vm.error = 'Please select a valid subscription option';
            }
        };

    }

    SubscriptionInfoController.$inject = ['AppConfig', '$state', '$log'];
    SubscriptionInfoDirective.$inject = [];

    angular.module('companies')
        .controller('SubscriptionInfoController', SubscriptionInfoController)
        .directive('osetSubscriptionInfo', SubscriptionInfoDirective);
})();
