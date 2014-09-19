'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users');
    var drivers = require('../../app/controllers/drivers');

    // Drivers Routes
    app.route('/drivers/create').post(users.requiresLogin, drivers.create);

    app.route('/drivers')
        .get(drivers.list)
        .post(users.requiresLogin, drivers.create);

    app.route('/drivers/:driverId')
        .get(drivers.read)
        .put(users.requiresLogin, drivers.hasAuthorization, drivers.update)
        .delete(users.requiresLogin, drivers.hasAuthorization, drivers.delete);

    // Finish by binding the Driver middleware
    app.param('driverId', drivers.driverByID);


    app.route('/driver/user')
        .get(drivers.list);

    app.route('/driver/user/:userId')
        .get(drivers.read);

    app.param('userId', drivers.driverByUserID);


    // TODO: Move to Licenses
    app.route('/driver/newlicense').get(drivers.newLicense);
};
