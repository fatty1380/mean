
var path = require('path'),
    config = require(path.resolve('./config/config')),
    braintree = require('braintree');

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: config.braintree.MerchantId,
    publicKey: config.braintree.PublicKey,
    privateKey: config.braintree.PrivateKey
});

exports.getToken = function(req, res) {
    gateway.clientToken.generate({
        customerId: req.user._id
    }, function (err, response) {
        var clientToken = response.clientToken;

        res.json(clientToken);
    });
};

exports.postNonce = function(req, res) {
    var nonce = req.body.payment_method_nonce;
    debugger;

    gateway.transaction.sale({
        amount: '10.00',
        paymentMethodNonce: nonce,
    }, function (err, result) {
    });
};
