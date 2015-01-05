'use strict';

var path      = require('path'),
    config    = require(path.resolve('./config/config')),
    braintree = require('braintree');

console.log('starting braintree with config: %j', config);

var gateway;

if (config.braintree &&
    (config.braintree.MerchantId && config.braintree.PublicKey && config.braintree.PrivateKey)) {
    gateway = braintree.connect({
        environment: braintree.Environment.Sandbox,
        merchantId: config.braintree.MerchantId,
        publicKey: config.braintree.PublicKey,
        privateKey: config.braintree.PrivateKey
    });
    // TODO : add error checking code
}

exports.getToken = function (req, res) {
    if (gateway) {
        gateway.clientToken.generate({
            customerId: req.user._id
        }, function (err, response) {
            var clientToken = response.clientToken;

            res.json(clientToken);
        });
    } else {
        res.status(500).send({
            message: 'Unable to initialize Braintree Payment Gateway'
        });
    }
};

exports.postNonce = function (req, res) {
    if (gateway) {
        var nonce = req.body.payment_method_nonce;
        debugger;

        gateway.transaction.sale({
            amount: '10.00',
            paymentMethodNonce: nonce,
        }, function (err, result) {

            if (err) {
                console.error('Transaction failed with error', err);
                return res.status(500).send(err);
            }
        });
    } else {
        res.status(500).send({
            message: 'Unable to initialize Braintree Payment Gateway'
        });
    }
};
