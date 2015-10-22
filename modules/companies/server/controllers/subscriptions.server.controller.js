var mongoose = require('mongoose'),
	path = require('path'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	constants = require(path.resolve('./modules/core/server/models/outset.constants'));

var Company = mongoose.model('Company'),
	Subscription = mongoose.model('Subscription');

exports.getSubscription = getSubscription;
exports.createSubscription = createSubscription;
exports.saveSubscription = saveSubscription;

function getSubscription(req, res) {
    if (!req.company) {
        var msg = 'No Company found for id `' + req.companyId + '`';
        req.log.info({ companyId: req.companyId }, msg);
        return res.status(404).send(msg);
    }

    var subscription = req.company.subscription;

    if (!!subscription && subscription instanceof mongoose.Types.ObjectId) {
        Subscription.findById(subscription.id)
            .exec(function (err, subscription) {
                if (err) {
                    var msg = errorHandler.getErrorMessage(err);
                    req.log.error(err, 'Failed to load subscription due to `%s`', msg);
                    return res.status(401).send({ message: msg });
                }

                req.log.trace({ subcription: subscription }, 'Returning Subscription %s', subscription.id);
                return res.json(subscription);
            });
    } else {
        return res.json(subscription);
    }
}

function createSubscription(req, res, next) {

    if (!req.company) {
        var msg = 'No Company found for id `' + req.companyId + '`';
        req.log.info({ companyId: req.companyId }, msg);
        return res.status(400).send(msg);
    }

    /**
     * Query Parameters - Possible
     * ---------------------------
     * planId: The Braintree planId specified in the order
     * promoCode: The Braintree promo-code
     * nonce: The Braintree payment nonce used to transfer payment info securely
     * price: The price shown on the client, for verification
     * companyId: The company ordering the subscription
     */

    req.planId = req.query.planId;
    req.promoCode = req.query.promoCode;
    req.price = req.query.price;


    req.log.debug('[CreateSubscription] Looking up subscription for planId: %s', req.planId);
    req.subscriptionType = _.find(constants.subscriptionPackages.packages, { 'planId': req.planId });

    next();
}

function saveSubscription(req, res) {
    if (!!req.paymentResult && req.paymentResult.success) {

        var subscription = req.paymentResult.subscription;

        var sub = new Subscription({
            name: req.planDetails.name,
            sku: req.planDetails.id,
            used: 0,
            available: req.subscriptionType.jobCt,
            renews: new Date(subscription.billingPeriodEndDate),
            status: subscription.status.toLowerCase(),
            remoteSubscriptionId: subscription.id,
            company: req.company
        });

        req.log.debug('[CompanySubscription] Creating new subscription: %j', sub);

        sub.save(function (err, newSub) {
            if (err) {
                req.log.debug('[CompanySubscription.sub] error saving subscription information: ', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err),
                    error: err
                });
            }

            req.log.debug('[Subscription] Successfully saved subscription with id `%s`!', newSub.id);

            req.log.debug('[CompanySubscription] Saving sub to company `%s`: %j', req.company.id, req.company);

            Company.findOneAndUpdate({ _id: req.company.id }, { 'subscription': newSub._id }, { new: true }, function (err, updatedCo) {
                if (err) {
                    req.log.debug('[CompanySubscription.co] error saving subscription information: ', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err),
                        error: err
                    });
                } else {
                    req.log.debug('[CompanySubscription.co] Successfully created subscription to company `%s`!', updatedCo.id);
                    res.json(sub);
                }
            });
        });
    } else {
        res.status(400).send({
            message: 'Unable to create subscription on server',
            serverData: req.paymentResult
        });
    }
}
