'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var drivers = require('../../app/controllers/drivers.server.controller');

    // Drivers Routes
    app.route('/drivers/create').post(users.requiresLogin, drivers.create);

    app.route('/drivers')
        .get(drivers.list)
        .post(users.requiresLogin, drivers.create);

    app.route('/drivers/:driverId')
        .get(drivers.read)
        .put(users.requiresLogin, drivers.hasAuthorization, drivers.update)
        .delete(users.requiresLogin, drivers.hasAuthorization, drivers.delete);

    // Setup routes for getting a User's driver profile
    app.route('/users/:userId/driver')
        .get(drivers.read);

    // Finish by binding the Driver middleware
    app.param('driverId', drivers.driverByID);
    app.param('userId', drivers.driverByUserID);

    // TODO: Move to Licenses
    app.route('/driver/newlicense').get(drivers.newLicense);
};
