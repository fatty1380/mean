(function () {
    'use strict';

    function PaymentController($state, Payments, tokenResponse, report, applicant) {
        var vm = this;

        console.log('got server response: %o', tokenResponse);

        vm.token = tokenResponse.clientToken;
        vm.applicant = applicant;
        vm.report = report;

        vm.price = vm.report.promo || vm.report.price;

        braintree.setup(vm.token, 'dropin', {
            container: 'dropin',
            form: 'paymentAuthForm',
            paymentMethodNonceReceived: function (event, nonce) {
                event.preventDefault();

                vm.postPayment(event, nonce);
            }
        });

        vm.postPayment = function (event, nonce) {

            if (vm.processing) {
                console.log('Payment already in process');
                event.preventDefault();
                return;
            }

            vm.processing = true;

            var opts = {
                nonce: nonce,
                sku: vm.report.sku,
                applicantId: vm.applicant._id,
                price: vm.price
            };

            var payment = new (Payments.Nonce())(opts);

            payment.$save(function (response) {
                vm.setSuccess(response);
            }, function (errorResponse) {
                debugger;
                vm.processing = false;

                if (!errorResponse.status) {
                    vm.error = 'Sorry, but an unexpected error has occured. Please try again later';
                } else {
                    vm.error = errorResponse.data && errorResponse.data.message || 'Sorry, an error occured. Please try again later';
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
            vm.success = 'Order successfully placed. We will let you know as soon as your reports are ready!';
            vm.report = response;
        };
    }


    PaymentController.$inject = ['$state', 'Payments', 'token', 'report', 'applicant'];
    angular.module('payments')
        .controller('PaymentController', PaymentController);
})();
