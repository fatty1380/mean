'use strict';

module.exports = function (app) {
    var path = require('path'),
        users = require(path.resolve('./modules/users/server/controllers/users.server.controller')),
        braintree = require(path.resolve('./modules/payments/server/controllers/braintree.server.controller')),
        companies = require(path.resolve('./modules/companies/server/controllers/companies.server.controller'));

    var companyIdString = ':companyId([0-9a-fA-F]{24})';
    // Companies Routes
    app.route('/api/companies')
        .get(companies.list)
        .post(users.requiresLogin, companies.create);

    app.route('/api/companies/' + companyIdString)
        .get(companies.read)
        .put(users.requiresLogin, companies.hasAuthorization, companies.update)
        .delete(users.requiresLogin, companies.hasAuthorization, companies.delete);

    app.route('/api/companies/' + companyIdString + '/drivers')
        .get(companies.listDrivers);

    app.route('/api/companies/' + companyIdString + '/picture')
        .post(companies.changeProfilePicture);

    app.route('/api/companies/' + companyIdString + '/subscription')
        .get(companies.getSubscription)
        .post(companies.createSubscription, braintree.findOrCreateCustomer, braintree.postSubscription, companies.saveSubscription);

    app.route('/api/companies/subscriptions')
        .get(braintree.getPlanDetails);

    app.route('/api/companies/subscriptions/:planId')
        .get(braintree.getPlanDetails);

    app.route('/api/users/:userId([0-9a-fA-F]{24})/companies')
        //.get(companies.companiesByUserID);
        .get(companies.companyByUserID, companies.read);
        
        /**
         * New Company Routes : Social
         */
    app.route('/api/companies/' + companyIdString + '/follow')
        .all(users.requiresLogin)
        .post(companies.follow)
        .delete(companies.unfollow);

    // Finish by binding the Company middleware
    app.param('companyId', companies.companyByID);
};
