'use strict';

module.exports = function(app) {
    var users = require('../../../../modules/users/server/controllers/users.server.controller');
    var drivers = require('../controllers/drivers.server.controller');

    // Drivers Routes
    app.route('/api/drivers/create').post(users.requiresLogin, drivers.create);

    app.route('/api/drivers')
        .get(drivers.list)
        .post(users.requiresLogin, drivers.create);

    // Setup routes for getting a User's driver profile
    app.route('/api/users/:userId/driver')
        .get(drivers.driverByUserID, drivers.read);
    app.route('/api/drivers/me')
        .get(drivers.me, drivers.read);

    app.route('/api/drivers/:driverId')
        .get(drivers.read)
        .put(users.requiresLogin, drivers.hasAuthorization, drivers.update)
        .delete(users.requiresLogin, drivers.hasAuthorization, drivers.delete);

    // Finish by binding the Driver middleware
    app.param('driverId', drivers.driverByID);

    // TODO: Move to Licenses
    app.route('/api/driver/newlicense').post(drivers.newLicense);
};
