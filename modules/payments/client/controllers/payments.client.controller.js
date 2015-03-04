(function () {
    'use strict';

    function PaymentController($state, $log, Payments, tokenResponse, report, applicant, company) {
        var vm = this;

        console.log('got server response: %o', tokenResponse);

        vm.token = tokenResponse.clientToken;
        vm.applicant = applicant;
        vm.report = report;
        vm.company = company;

        vm.price = vm.report.promo || vm.report.price;

        vm.logo = !!vm.company ? vm.report.logo : vm.report.logo || './modules/bgchecks/img/everifile_logo.png';

        braintree.setup(vm.token, 'dropin', {
            container: 'dropin',
            form: 'paymentAuthForm',
            paymentMethodNonceReceived: function (event, nonce) {
                event.preventDefault();

                vm.postPayment(event, nonce);
            }
        });

        vm.initSubscriptions = function() {

            Payments.Plans.getOne({planId: report.planId}).$promise.then(
                function(success) {
                    vm.serverPlan = success;
                },
                function(error) {
                    $log.error('No Plan found on server for planId `%s`', report.planId);
                    vm.error = 'Sorry, the plan you are trying to order is not currently available';

                    Raygun.send(new Error('Unknown PlanId: ' + report.planId));
                }
            );
            debugger;
            if (!!vm.report && vm.report.features) {

                vm.features = _.keys(vm.report.features);
            }
        };

        if(!!vm.company) {
            vm.initSubscriptions();
        }

        vm.applyPromo = function() {
            vm.promoCode = vm.promoCode.toUpperCase();

            $log.debug('looking for promo code `' + vm.promoCode + '`');

            if(vm.serverPlan && vm.serverPlan.discounts) {
                vm.promoItem = _.find(vm.serverPlan.discounts, {'id': vm.promoCode});
                debugger;

                if(!!vm.promoItem) {
                    vm.promoError = null;
                    $log.debug('Found promo item %o', vm.promoItem);
                    vm.subtotal = parseFloat(vm.serverPlan.price) - parseFloat(vm.promoItem.amount);

                    vm.promoItem.priceString = vm.getPriceString(vm.promoItem.amount);
                    vm.subtotalString = vm.getPriceString(vm.subtotal);

                }
                else {
                    $log.debug('No Promo Item found');
                    vm.promoError = 'No promo code found matching ' + vm.promoCode;
                    vm.promoCode = null;
                }
            }
        };

        vm.postPayment = function (event, nonce) {

            if (vm.processing) {
                console.log('Payment already in process');
                event.preventDefault();
                return;
            }

            vm.processing = true;
            var opts, payment;

            if(!!vm.company) {
                // Set options for recurring subscriptions
                opts = {
                    nonce: nonce,
                    planId: vm.serverPlan.id,
                    companyId: vm.company._id,
                    price: vm.serverPlan.price
                };

                if(!!vm.promoItem) {
                    opts.promoCode = vm.promoItem.id;
                    opts.price = vm.subtotal;
                }

                payment = new (Payments.Subscription)(opts);

            }
            else {
                // Set options for BG Check Report
                opts = {
                    nonce: nonce,
                    sku: vm.report.sku,
                    applicantId: vm.applicant._id,
                    price: vm.price
                };

                payment = new (Payments.Nonce())(opts);

            }


            payment.$save(function (response) {
                vm.setSuccess(response);
            }, function (errorResponse) {
                vm.processing = false;

                if (!errorResponse.status) {
                    vm.error = 'Please try again later';
                } else {
                    vm.error = errorResponse.data && errorResponse.data.message || 'Please try again later (' + errorResponse.status + ')';
                }
            });
        };

        vm.getPriceString = function (price) {
            var base = Number(price);
            var next = base.toFixed(2);
            return '$' + next;
        };

        vm.setSuccess = function (response) {
            debugger;
            console.log('Holy crap! Response: %o', response);
            if(!!vm.company) {
                vm.success = 'Subscription successful! You can now start posting jobs on Outset';
            } else {
                vm.success = 'Order successfully placed. We will let you know as soon as your reports are ready!';
            }

            vm.report = response;
        };
    }


    PaymentController.$inject = ['$state', '$log', 'Payments', 'token', 'report', 'applicant', 'company'];
    angular.module('payments')
        .controller('PaymentController', PaymentController);
})();
