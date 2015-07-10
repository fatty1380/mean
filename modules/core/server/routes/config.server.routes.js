'use strict';

module.exports = function(app) {
	// Root routing
    var
        path         = require('path'),
        config       = require(path.resolve('./modules/core/server/controllers/config.server.controller'));

    app.route('/api/config')
        .get(config.getAllConfigs);

    app.route('/api/config/:configName')
        .get(config.read);

    app.param('configName', config.getConfig);
};
