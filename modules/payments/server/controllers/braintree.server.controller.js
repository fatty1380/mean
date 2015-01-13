'use strict';

var path      = require('path'),
    config    = require(path.resolve('./config/config')),
    mongoose  = require('mongoose'),
    Bgcheck   = mongoose.model('BackgroundReport'),
    braintree = require('braintree');

var gateway;

function initGateway() {

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

    initGateway();

    if (gateway) {
        gateway.clientToken.generate({
            //customerId: req.user._id
        }, function (err, response) {
            if (err) {
                console.log('Error getting token: %j', err);
                return res.status(500).send(err);
            }
            console.log('got response %j', response);
            //var clientToken = response.clientToken;

            res.json(response);
        });
    } else {
        res.status(500).send({
            message: 'Unable to initialize Braintree Payment Gateway'
        });
    }
};

exports.postNonce = function (req, res, next) {

    if (!req.applicant) {
        console.error('[postNonce] Unable to find local applicant. rejecting request');
        return res.status(404).send({
            message: 'Applicant information not found'
        });
    }

    if (!req.reportType) {
        console.error('[postNonce] Unknown report type - cannot process without price & report info!');
        return res.status(500).send({
            message: 'No Pricing information found'
        });
    }

    var price = req.body.price;

    if (!price) {
        console.error('[postNonce] Invalid Price : %s', price);
    }

    if (price !== req.reportType.price && price !== req.reportType.promo) {
        console.error('[postNonce] mismatched Price : %s', price);
        return res.status(500).send({
            message: 'No Pricing information found'
        });
    }

    var nonce = req.body.nonce || req.query.nonce; // jshint ignore: line

    if (!nonce) {
        console.error('[postNonce] no NONCE, no sale!');
        return res.status(500).send({
            message: 'No Payment Information found in request'
        });
    }

    if (!gateway) {
        initGateway();
        debugger;
    }

    if (gateway) {

        var reportType = req.reportType;

        var saleInformation = {
            amount: price,
            paymentMethodNonce: nonce,
            //orderId: 'todo',
            customer: {
                id: req.user.id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                phone: req.user.phone,
                email: req.user.email
            },
            options: {
                storeInVaultOnSuccess: true,
                submitForSettlement: true
            },
            //customFields: {
            //    sku: reportType
            //}
        };

        console.log('[postNonce] Ordering %s and processing payment with options: %j', reportType, saleInformation);

        gateway.transaction.sale(saleInformation, function (err, result) {

            if (err) {
                console.error('Transaction failed with error', err);
                return res.status(500).send(err);
            }

            req.paymentResult = result;

            console.log('[PostNonce] Payment Result: %j', result);

            if(result.success) {
                console.error('OVERRIDING SUCCESS CODE FOR TESTING');

                var bgcheck = new Bgcheck({
                    user: req.user,
                    remoteApplicantId: req.applicant.remoteId,
                    localReportSku: req.reportType.sku,
                    status: 'PAID',
                    paymentInfo: req.paymentResult
                });

                console.log('[PostNonce] Greating bg check record: %j', bgcheck);

                bgcheck.save(function (err) {
                    if (err) {
                        console.log('[PostNonce] Uable to save due to error: %j', err);
                        return res.status(400).send({
                            message: err.message
                        });
                    }

                    req.bgcheck = bgcheck;

                    // bgcheck was saved successfully
                    // update teh applicant's record
                    var applicant = req.applicant;
                    applicant.reports.push(bgcheck);

                    console.log('[PostNonce] pushing bg check to applicant reports', req.applicant.reports);

                    applicant.save(function (err) {
                        if (err) {
                            console.error('Crap, unable to save applicant %j', applicant, err);
                        }

                        req.applicant = applicant;

                        console.log('[PostNonce] continuing on ...');
                        next();
                    });


                });
            }
            else {
                res.status(500).send({
                    message: result.message
                });
            }

        });
    } else {
        res.status(500).send({
            message: 'Unable to initialize Braintree Payment Gateway'
        });
    }
};
