'use strict';

module.exports = function(app) {
	var ats = require('../controllers/ats.server.controller');
	var atsPolicy = require('../policies/ats.server.policy');

	// Ats Routes
    app.route('/api/ats').all()
        .get(ats.list)
        .all(atsPolicy.isAllowed);

    app.route('/api/ats/:atsId')
        .all(atsPolicy.isAllowed)
		.get(ats.read)
        .put(ats.update)
        .delete(ats.removeApplicant);
        
    app.route('/api/jobs/:jobId/apply')
        .post(ats.createApplicant);

	// Finish by binding the At middleware
	app.param('atsId', ats.atsByID);
};