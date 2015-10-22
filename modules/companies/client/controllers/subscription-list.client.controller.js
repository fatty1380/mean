(function () {
    'use strict';

    function SubscriptionListController(auth, subscriptions, subscription, $state, $stateParams, AppConfig) {
        var vm = this;

        vm.skus = $stateParams.sku;
        vm.subscriptions = subscriptions;
        vm.user = auth.user;
        vm.companyId = auth.user.company && (auth.user.company._id || auth.user.company);

        vm.text = {
            lead: 'Get started with a basic package ...',
            sub: '&hellip;or take a look at our fully featured packages to take care of your entire hiring process'
        };

        vm.subscription = subscription;
        vm.packages = vm.subscriptions.packages;

        if (vm.subscription && vm.subscription.isValid) {
            vm.text.lead = 'Current Subscription Level';
            if (!!vm.subscription.isValid) {
                vm.text.sub = 'Would you like to upgrade your subscription?';
            }
            else {
                vm.text.sub = 'Renew your current subscription or change plans below';
            }


            vm.subscription = _.extend(vm.subscription, _.find(vm.packages, {'planId': vm.subscription.planId}));

            var features = vm.subscription.features;
            vm.features = _.keys(features);
        } else {
            debugger;
        }

        AppConfig.getFaqs({category: ['employer', 'subscriptions']}).then(function (vals) {

            console.log('[FAQ] promise resolved with %d vals', vals.length);

            vm.faqs = vals;
            return vals;
        });

        AppConfig.getAsync('employer').then(function (subs) {
            console.log('got subscription information: %o', subs);
        }, function (errs) {
            console.log('err :( %o', errs);
        });
    }


    SubscriptionListController.$inject = ['Authentication', 'subscriptions', 'subscription', '$state', '$stateParams', 'AppConfig'];

    angular.module('companies').controller('SubscriptionListController', SubscriptionListController);

})();
