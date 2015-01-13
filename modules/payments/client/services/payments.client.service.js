(function () {
    'use strict';


//Jobs service used to communicate Jobs REST endpoints
    function PaymentService($resource) {
        var _this = this;

        _this.data = {
            getToken: function () {
                var rsrc = $resource('/api/payments/token', {}, {
                    get: {
                        method: 'GET',
                        isArray: false
                    }
                });

                return rsrc.get();
            },
            Nonce: function() {
                return $resource('/api/reports/types/:sku/create', {
                    sku: '@sku',
                    nonce: '@nonce',
                    price: '@price',
                    applicantId: '@applicantId',
                    payment_nonce_id: 'payment_nonce_id'
                }, {
                    $save: {
                        method: 'POST'
                    }
                });
            }
        };

        return _this.data;
    }


    PaymentService.$inject = ['$resource'];

    angular
        .module('payments')
        .factory('Payments', PaymentService);


})
();
