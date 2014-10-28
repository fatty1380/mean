'use strict';

module.exports = function(app) {
<<<<<<< HEAD
    // Root routing
    var core = require('../../app/controllers/core');

    app.route('/').get(core.index);

    app.route('/config')
        .get(core.getAllConfigs);

    app.route('/config/:name')
        .get(core.read);

    app.param('configName', core.getConfig);
};
=======
	// Root routing
	var core = require('../../app/controllers/core.server.controller');
	app.route('/').get(core.index);
};
>>>>>>> a7243763ea765d2ce4a837bb8fe138355f9e8640
