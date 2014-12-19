'use strict';

module.exports = function(app) {
    var users = require('../../../../modules/users/server/controllers/users.server.controller');
    var companies = require('../controllers/companies.server.controller');

    // Companies Routes
    app.route('/api/companies')
        .get(companies.list)
        .post(users.requiresLogin, companies.create);

    app.route('/api/companies/:companyId')
        .get(companies.read)
        .put(users.requiresLogin, companies.hasAuthorization, companies.update)
        .delete(users.requiresLogin, companies.hasAuthorization, companies.delete);

    app.route('/api/companies/:companyId/drivers')
        .get(companies.listDrivers);

    app.route('/api/companies/:companyId/picture')
        .post(companies.changeProfilePicture);

    app.route('/api/users/:userId/companies')
        //.get(companies.companiesByUserID);
        .get(companies.companyByUserID, companies.read);

    // Finish by binding the Company middleware
    app.param('companyId', companies.companyByID);
};
