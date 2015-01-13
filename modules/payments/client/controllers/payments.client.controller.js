(function() {
    'use strict';

    function PaymentController($state, Payments, tokenResponse, report, applicant) {
        var vm = this;

        console.log('got server response: %o', tokenResponse);

        vm.token = tokenResponse.clientToken;
        vm.applicant = applicant;
        vm.report = report;

        braintree.setup(vm.token, 'dropin', {
            container: 'dropin',
            form: 'paymentAuthForm',
            paymentMethodNonceReceived: function(event, nonce) {
                event.preventDefault();

                vm.postPayment(event, nonce);
            }
        });

        vm.postPayment = function (event, nonce) {


            var opts = {
                nonce: nonce,
                sku: vm.report.sku,
                applicantId: vm.applicant._id,
                price : vm.report.price
            };

            var payment = new (Payments.Nonce())(opts);

            payment.$save(function(response) {
                debugger;
                console.log('Holy crap! Response: %o', response);
                vm.success = 'Order successfully placed. We will let you know as soon as your reports are ready!';
                vm.report = response;
            }, function(errorResponse) {
                debugger;
                vm.error = errorResponse.data.message;
            });
        };

        vm.getPriceString = function(price) {
            var base = Number(price);
            var next = base.toFixed(2);
            return '$'+next;
        };
    }


    PaymentController.$inject = ['$state', 'Payments', 'token', 'report', 'applicant'];
    angular.module('payments')
        .controller('PaymentController', PaymentController);
})();
