(function () {
    'use strict';

    function SubscriptionListController(subscriptions, $stateParams, AppConfig) {
        var vm = this;

        vm.skus = $stateParams.sku;

        vm.subscriptions = subscriptions;

        vm.faqs = AppConfig.getFaqs({category: 'subscriptions'}).then(function (vals) {

            console.log('[FAQ] promise resolved with %d vals', vals.length);

            vm.faqs = vals;
            return vals;
        });

        vm.text = {
            lead: 'Start with a 1 week trial subscriptions&hellip;',
            sub: '&hellip;then upgrade to one of our packages'
        };

        vm.packages = {
            base: {
                title: 'Trial Subscription',
                sub: '<ul><li>Two Weeks to try Outset</li><li>Unlimited Access</li></ul>',
                duration: 'two weeks',
                name: '',
                price: '5',
                promo: '1',
                sku: 'SUB_INTRO',
                enabled: true
            },
            good: {
                title: 'Good',
                name: 'Good',
                price: '10',
                sku: 'SUB-GOOD',
                enabled: true,
                duration: 'per month'
            },
            better: {
                title: 'Better',
                name: 'Premium',
                price: '40',
                sku: 'SUB-BETTER',
                enabled: true,
                duration: 'per month'
            },
            best: {
                title: 'Best',
                name: 'Enterprise',
                price: '80',
                sku: 'SUB-BEST',
                enabled: true,
                duration: 'per month'
            },
            enterprise: {
                title: 'Enterprise',
                sub: 'Do you have a larger fleet that you\'re trying to keep running?<br/>Contact us and we will tailor a plan to fit your needs',
                price: 'contact us...',
                sku: 'SUB-ENTERPRISE',
                enabled: true
            }
        };

        AppConfig.getAsync('subscriptions').then(function (subs) {
            console.log('got subscirptino information: %o', subs);

            if (!!subs.length) {
                vm.packages = subs;
            }
        }, function (errs) {
            console.log('err :( %o', errs);
        });
    }


    SubscriptionListController.$inject = ['subscriptions', '$stateParams', 'AppConfig'];

    angular.module('companies').controller('SubscriptionListController', SubscriptionListController);

})();
