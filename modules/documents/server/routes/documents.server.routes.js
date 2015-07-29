'use strict';

module.exports = function(app) {
	var documents = require('../controllers/documents.server.controller');
	var documentsPolicy = require('../policies/documents.server.policy');

	// Documents Routes
	app.route('/api/documents').all()
		.get(documents.list).all(documentsPolicy.isAllowed)
		.post(documents.create);

	app.route('/api/documents/:documentId').all(documentsPolicy.isAllowed)
		.get(documents.read)
		.put(documents.update)
		.delete(documents.delete);

	// Finish by binding the Document middleware
	app.param('documentId', documents.documentByID);
};