(function () {
    'use strict';

    function SubscriptionListController(subscriptions, $state, $stateParams, AppConfig) {
        var vm = this;

        vm.skus = $stateParams.sku;

        vm.subscriptions = subscriptions;

        vm.faqs = AppConfig.getFaqs({category: 'subscriptions'}).then(function (vals) {

            console.log('[FAQ] promise resolved with %d vals', vals.length);

            vm.faqs = vals;
            return vals;
        });

        vm.text = {
            lead: 'Get started with a basic package ...',
            sub: '&hellip;or take advantage of our introductory pricing to post unlimited jobs'
        };

        AppConfig.getAsync('subscriptions').then(function (subs) {
            console.log('got subscription information: %o', subs);
        }, function (errs) {
            console.log('err :( %o', errs);
        });

        vm.orderSubscription = function(planId) {
            if(!!planId) {
                $state.go('subscriptionPayment', {'planId': planId, promo: vm.promoCode});
            }
            else {
                vm.error = 'Please select a valid subscription option';
            }
        };
    }


    SubscriptionListController.$inject = ['subscriptions', '$state', '$stateParams', 'AppConfig'];

    angular.module('companies').controller('SubscriptionListController', SubscriptionListController);

})();
