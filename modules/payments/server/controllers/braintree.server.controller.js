'use strict';

var path      = require('path'),
    config    = require(path.resolve('./config/config')),
    mongoose  = require('mongoose'),
    Bgcheck   = mongoose.model('BackgroundReport'),
    braintree = require('braintree'),
    moment    = require('moment'),
    _         = require('lodash'),
    Q         = require('q');

var gateway;
var subscriptionPlans = [];
var plansLastUpdated;

function initGateway() {

    if (!!gateway) {
        return;
    }

    console.log('[Braintree.initGateway] Start');

    if (config.services.braintree &&
        (config.services.braintree.MerchantId && config.services.braintree.PublicKey && config.services.braintree.PrivateKey)) {

        var env;

        switch (config.services.braintree.environment) {
            case 'sandbox':
                env = braintree.Environment.Sandbox;
                break;
            case 'production':
                env = braintree.Environment.Production;
                break;
            default:
                env = braintree.Environment.Sandbox;
        }

        var options = {
            environment: env,
            merchantId: config.services.braintree.MerchantId,
            publicKey: config.services.braintree.PublicKey,
            privateKey: config.services.braintree.PrivateKey
        };

        console.log('[BraintreeInit] Initializing gw with options: %j', options);

        gateway = braintree.connect(options);


        console.log('[BraintreeInit] Gateway %s', !!gateway);
    }
    return null;

}

exports.getToken = function (req, res) {

    if (!gateway) {
        initGateway();
        debugger;
    }

    if (gateway) {

        var generator = !!req.braintreeCustomer ? {customerId: req.braintreeCustomer.id} : {};

        console.log('[Braintree.getToken] Initializing client token with generator: %j', generator);

        gateway.clientToken.generate(generator,
            function (err, response) {
                if (err) {
                    console.log('[Braintree.getToken] Error getting token: %j', err);
                    return res.status(500).send(err);
                }

                console.log('[Braintree.getToken] got response %j', response);

                res.json(response);
            });
    } else {
        console.log('[Braintree.getToken] Gateway is unavailable - aborting');
        res.status(500).send({
            message: 'Unable to initialize Braintree Payment Gateway'
        });
    }
};


var findTheCustomer = function (req, res, next, createIfNull) {
    initGateway();

    var customerId = req.user.id;

    gateway.customer.find(customerId, function (err, customer) {
        if (err) {
            console.log('[Braintree.findTheCustomer] failed with error: %j', err);
        }

        if (!customer && createIfNull) {
            console.log('[Braintree.findTheCustomer] No customer - creating one', err);
            exports.createCustomer(req, res, next);
        }
        else {

            req.braintreeCustomer = customer;
            next();
        }
    });
};


exports.findOrCreateCustomer = function (req, res, next) {
    findTheCustomer(req, res, next, true);
};

exports.findCustomer = function (req, res, next) {
    findTheCustomer(req, res, next, false);
};

exports.createCustomer = function (req, res, next) {
    initGateway();

    console.log('[Braintree] Creating new customer for user `%s`', req.user.id);

    var customer = {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone,
        email: req.user.email
    };

    if (!!req.body.nonce || !!req.query.nonce) {
        console.log('[Create Customer] Payment Nonce Present - Body: %s, Query: %s', !!req.body.nonce, !!req.query.nonce);
        customer.paymentMethodNonce = req.body.nonce || req.query.nonce;
    }

    gateway.customer.create(customer, function (err, result) {
        if (err) {
            console.log('[Braintree] Failed to createCustomer due to error: %j', err);
        }

        if (result.success) {
            req.braintreeCustomer = result.customer;
        }

        next();
    });
};

exports.postApplicant = function (req, res, next) {

    if (!req.applicant) {
        console.error('[initializeTransaction] Unable to find local applicant. rejecting request');
        return res.status(404).send({
            message: 'Applicant information not found'
        });
    }

    if (!req.reportType) {
        console.error('[initializeTransaction] Unknown report type - cannot process without price & report info!');
        return res.status(500).send({
            message: 'No Pricing information found'
        });
    }

    var price = req.body.price;

    if (!price) {
        console.error('[initializeTransaction] Invalid Price : %s', price);
    }

    if (price !== req.reportType.price && price !== req.reportType.promo) {
        console.error('[initializeTransaction] mismatched Price : %s', price);
        return res.status(500).send({
            message: 'No Pricing information found'
        });
    }

    if (initializeTransaction(req, res)) {
        runSingleTransaction(req, res, next);
    }
};

var initializeTransaction = function (req, res) {

    console.log('Payment Nonce Presence - Body: %s, Query: %s', !!req.body.nonce, !!req.query.nonce);

    var nonce = req.body.nonce || req.query.nonce; // jshint ignore: line

    if (!nonce) {
        console.error('[initializeTransaction] no NONCE, no sale!');
        return res.status(500).send({
            message: 'No Payment Information found in request'
        });
    }

    initGateway();

    if (gateway) {

        req.saleInformation = {
            amount: req.body.price,
            options: {
                submitForSettlement: true
            }
        };

        if (req.braintreeCustomer) {
            console.log('[initializeTransaction] Existing customer, no need to send date, it\'s in the nonce!');
            req.saleInformation.customerId = req.braintreeCustomer.id;
        }
        else {
            console.log('[initializeTransaction] Creating new customer');
            req.saleInformation.customer = {
                id: req.user.id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                phone: req.user.phone,
                email: req.user.email
            };

            req.saleInformation.paymentMethodNonce = nonce;
            req.saleInformation.options.storeInVaultOnSuccess = true;
        }

        console.log('[initializeTransaction] Ordering %s and processing payment with options: %j', req.reportType, req.saleInformation);

        return true;
    } else {
        res.status(500).send({
            message: 'Unable to initialize Braintree Payment Gateway'
        });
    }

    return false;
};

var runSingleTransaction = function (req, res, next) {
    gateway.transaction.sale(req.saleInformation, function (err, result) {

        if (err) {
            console.error('[runSingleTransaction] Transaction failed with error', err);
            return res.status(500).send(err);
        }

        req.paymentResult = result;

        console.log('[runSingleTransaction] Payment Result: %j', result);

        if (result.success) {

            console.log('[runSingleTransaction] Successful payment - moving on to next step');

            next();
        }
        else {
            console.log('[runSingleTransaction] Failed payment - returning error');

            res.status(500).send({
                message: result.message
            });
        }

    });
};

var getLatestPlanDetails = function () {
    var deferred = Q.defer();

    if (!plansLastUpdated || plansLastUpdated.add('minutes', 15) < moment()) {
        initGateway();

        gateway.plan.all(function (err, result) {
            if (err) {
                deferred.reject(err);
            }

            console.log('[Braintree.getLatestPlanDetails] Got result plans: %j', result);

            plansLastUpdated = moment();
            subscriptionPlans = result.plans;

            deferred.resolve(subscriptionPlans);
        });
    }
    else {
        deferred.resolve(subscriptionPlans);
    }

    return deferred.promise;
};

var getAllPlans = function (req, res, next) {

    getLatestPlanDetails().then(
        function (currentPlans) {
            if (currentPlans && currentPlans.length) {
                console.log('[Braintree.getAllPlans] Returning subscription details for %d plans', currentPlans.length);
                return res.json(currentPlans);
            }

            console.error('[Braintree.getAllPlans] No Subscriptions found on server');

            return res.status(404).send({
                message: 'No Available Subscription Plans found'
            });
        },
        function (err) {
            console.error('[Braintree.getAllPlans] Error finding subscription details', err);
            return res.status(500).send({
                message: err.message,
                params: err.params
            });
        }
    );
};

exports.getPlanDetails = function (req, res, next) {

    if (!!req.params.planId) {
        getLatestPlanDetails().then(
            function (currentPlans) {
                var plan = _.find(currentPlans, {'id': req.params.planId});

                if (!!plan) {
                    console.log('[Braintree.getSubscriptionDetails] Found subscription details for planId %s', plan.id);
                } else {
                    console.error('[Braintree.getSubscriptionDetails] Unable to find plan for ID %s', req.params.planId);

                    return res.status(404).send({
                        message: 'Unknown Plan identifier',
                        params: req.params.planId
                    });
                }

                if (!_.isEmpty(req.query) && !!req.query.promoCode) {
                    plan.discounts = _.filter(plan.discounts, function (disc) {
                        debugger;
                        return _.contains(req.query.promoCode, disc.id);
                    });
                }

                return res.json(plan);

            },
            function (err) {
                console.error('[Braintree.getSubscriptionDetails] Error finding subscription details', err);
                return res.status(400).send({
                    message: err.message,
                    params: err.params
                });
            });
    } else {
        return getAllPlans(req, res, next);
    }
};


exports.postSubscription = function (req, res, next) {

    if (!req.braintreeCustomer) {
        console.error('[postSubscription] No Known Braintree Customer found');
        return res.status(500).send({
            message: 'No Braintree Customer Information present'
        });
    }

    if (!req.planId) {
        console.error('[postSubscription] Unknown plan type - cannot process without price & report info!');
        return res.status(500).send({
            message: 'No Plan information found'
        });
    }

    getLatestPlanDetails().then(
        function (currentPlans) {
            req.planDetails = _.find(currentPlans, {'id': req.planId});

            var price = req.query.price;

            if (!price) {
                console.error('[postSubscription] Invalid Price : %s', price);
            }

            var calcPrice = req.planDetails.price;
            console.log('[Braintree.postSubscription] Got base price `%s`', calcPrice);

            if(!!req.promoCode) {
                var discount = _.find(req.planDetails.discounts, {'id': req.promoCode});

                if(!!discount) {
                    calcPrice = calcPrice - discount.amount;
                    console.log('[Braintree.postSubscription] Calculated Subtotal `%s` based on discount `%s`', calcPrice, discount.amount);
                }
            }

            if (price !== calcPrice) {
                console.error('[postSubscription] mismatched Price : %s', price);
                return res.status(500).send({
                    message: 'No Pricing information found'
                });
            }

            if (initializeSubscription(req, res)) {
                runSubscriptionTransaction(req, res, next);
            }
        });



};

// req.braintreeCustomer.paymentMethodToken()


var initializeSubscription = function (req, res) {

    req.subscriptionInformation = {
        id: req.braintreeCustomer.id,
        planId: req.planId
    };

    var paymentToken;

    if(!!req.braintreeCustomer.paymentMethods) {
        // TODO: Use the "Find PaymentMethods" api call to simplify this
        var defaultMethod = _.find(req.braintreeCustomer.paymentMethods, {'default': true});

        if (!!defaultMethod) {
            paymentToken = defaultMethod.token;
        }
    } else if(!!req.braintreeCustomer.creditCards) {
        var defaultCC = _.find(req.braintreeCustomer.creditCards, {'default': true});

        if (!!defaultCC) {
            paymentToken = defaultCC.token;
        }
    } else if(!!req.braintreeCustomer.paypalAccounts) {
        var defaultPaypal = _.find(req.braintreeCustomer.paypalAccounts, {'default': true});

        if (!!defaultPaypal) {
            paymentToken = defaultPaypal.token;
        }
    }

    if (!!paymentToken) {
        console.log('[Braintree.InitSubscription] Applying payment token from customer\'s information');
        req.subscriptionInformation.paymentMethodToken = paymentToken;
    }
    else {
        console.log('[Braintree.InitSubscription] Payment Nonce Presence - Body: %s, Query: %s', !!req.body.nonce, !!req.query.nonce);

        var nonce = req.body.nonce || req.query.nonce; // jshint ignore: line

        if (!nonce) {
            console.error('[Braintree.InitSubscription] no NONCE, no sale!');
            res.status(500).send({
                message: 'No Payment Information found in request'
            });
            return false;
        }

        req.subscriptionInformation.paymentMethodNonce = nonce;
    }

    if (!!req.promoCode) {
        console.log('[Braintree.InitSubscription] Applying promo code: %s', req.promoCode);
        req.subscriptionInformation.discounts = {
            add: {inheritedFromId: req.promoCode}
        };
    }

    console.log('[Braintree.InitSubscription] Ordering %s and processing payment with options: %j', req.reportType, req.saleInformation);

    return true;
};


var runSubscriptionTransaction = function (req, res, next) {

    initGateway();

    if (gateway) {

        console.log('[runSubscriptionTransaction] Creating subscription with settings: %o', req.subscriptionInformation);

        gateway.subscription.create(
            req.subscriptionInformation,
            function (err, result) {
                if (err) {
                    console.error('[runSubscriptionTransaction] Transaction failed with error', err);
                    return res.status(500).send(err);
                }

                req.paymentResult = result;

                console.log('[runSubscriptionTransaction] Payment Result: %j', result);

                if (result.success) {

                    console.log('[runSubscriptionTransaction] Successful payment - moving on to next step');

                    next();
                }
                else {
                    res.status(500).send({
                        message: result.message
                    });
                }

            });
    }
    else {
        res.status(500).send({
            message: 'Unable to initialize Braintree Payment Gateway'
        });
    }
};
