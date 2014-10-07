'use strict';

module.exports = function(app) {
    // Root routing
    var core = require('../../app/controllers/core');

    app.route('/').get(core.index);

    app.route('/config')
        .get(core.getAllConfigs);

    app.route('/config/:name')
        .get(core.read);

    app.param('configName', core.getConfig);
};
