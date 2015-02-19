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
                    applicantId: '@applicantId'
                }, {
                    $save: {
                        method: 'POST'
                    }
                });
            },
            Subscription: function() {
                return $resource('/api/companies/:companyId/subscription', {
                    planId: '@planId',
                    promoCode: '@promoCode',
                    nonce: '@nonce',
                    price: '@price',
                    companyId: '@companyId'
                }, {
                    $save: {
                        method: 'POST'
                    }
                });
            },
            Plans: function() {
                return $resource('/api/companies/subscriptions/:planId',{
                    planId: '@planId',
                    promoCode: '@promoCode'
                }, {
                    $get: {
                        method: 'GET',
                        isArray: true
                    },
                    getOne: {
                        method: 'GET',
                        isArray: false
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
