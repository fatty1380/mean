'use strict';
var path  = require('path'),
    admin = require(path.resolve('./modules/core/server/controllers/admin.server.controller'));

module.exports = function (app) {

    // Jobs Routes
    app.route('/api/admin/refreshJobPostDates')
        .get(admin.validateAdmin, admin.refreshJobs);
};
