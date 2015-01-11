'use strict';

var path      = require('path'),
    config    = require(path.resolve('./config/config')),
    braintree = require('braintree');


function getGateway() {

    if (config.services.braintree &&
        (config.services.braintree.MerchantId && config.services.braintree.PublicKey && config.services.braintree.PrivateKey)) {

        return braintree.connect({
            environment: braintree.Environment.Sandbox,
            merchantId: config.services.braintree.MerchantId,
            publicKey: config.services.braintree.PublicKey,
            privateKey: config.services.braintree.PrivateKey
        });
        // TODO : add error checking code
    }
    return null;

}

exports.getToken = function (req, res) {

    var gateway = getGateway();

    if (gateway) {
        gateway.clientToken.generate({
            customerId: req.user._id
        }, function (err, response) {
            if(err) {
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

exports.postNonce = function (req, res) {
    if (gateway) {
        var nonce = req.body.payment_method_nonce; // jshint ignore: line
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
