'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var companies = require('../../app/controllers/companies');

    // Companies Routes
    app.route('/companies')
        .get(companies.list)
        .post(users.requiresLogin, companies.create);

    app.route('/companies/:companyId')
        .get(companies.read)
        .put(users.requiresLogin, companies.hasAuthorization, companies.update)
        .delete(users.requiresLogin, companies.hasAuthorization, companies.delete);

    app.route('/profiles/:userId/company')
        .get(companies.read)
        .delete(users.requiresLogin, companies.hasAuthorization, companies.delete);

    // Finish by binding the Company middleware
    app.param('companyId', companies.companyByID);

    app.param('userId', companies.companyByUser);
};
