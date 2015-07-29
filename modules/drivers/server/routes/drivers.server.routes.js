'use strict';

module.exports = function (app) {
    var path = require('path'),
        users = require(path.resolve('./modules/users/server/controllers/users.server.controller')),
        drivers = require(path.resolve('./modules/drivers/server/controllers/drivers.server.controller'));

    /**
     * New "Driver" routes
     */
    app.route('/api/users/me/props')
        .put(users.requiresLogin, drivers.setProps)
        .get(users.requiresLogin, drivers.getProps);

    app.route('/api/users/me/experience')
        .put(users.requiresLogin, drivers.setExperience)
        .get(users.requiresLogin, drivers.getExperience);

    // Drivers Routes
    app.route('/api/drivers/create').post(users.requiresLogin, drivers.create);

    app.route('/api/drivers')
        .get(drivers.list)
        .post(users.requiresLogin, drivers.create);

    // Setup routes for getting a User's driver profile
    app.route('/api/users/:userId/driver')
        .get(drivers.driverByUserID, drivers.read);

    app.route('/api/drivers/:driverId')
        .get(drivers.read)
        .put(users.requiresLogin, drivers.hasAuthorization, drivers.update)
        .delete(users.requiresLogin, drivers.hasAuthorization, drivers.delete);


    app.route('/api/drivers/:driverId/resume')
        .post(users.requiresLogin, drivers.hasAuthorization, drivers.uploadResume)
        .get(users.requiresLogin, drivers.refreshResume);

    app.route('/api/drivers/:driverId/report/:reportSku')
        .get(users.requiresLogin, drivers.refreshReport);

    app.route('/api/drivers/:driverId/profileforms')
        .get(users.requiresLogin, drivers.getProfileFormAnswers)
        .post(users.requiresLogin, drivers.hasAuthorization, drivers.createProfileFormAnswers)
        .put(users.requiresLogin, drivers.hasAuthorization, drivers.updateProfileFormAnswers);


    // Finish by binding the Driver middleware
    app.param('driverId', drivers.driverByID);
};
