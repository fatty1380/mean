'use strict';

module.exports = function(app) {
	// Root routing
    var config = require('../../../../modules/core/server/controllers/config.server.controller');

    app.route('/api/config')
        .get(config.getAllConfigs);

    app.route('/api/config/:name')
        .get(config.read);

    app.param('configName', config.getConfig);
};
