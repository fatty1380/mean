'use strict';

module.exports = function(app) {
	var documents = require('../controllers/documents.server.controller');
	var documentsPolicy = require('../policies/documents.server.policy');

	// Documents Routes
	app.route('/api/documents')
		.all()
		.get(documents.list)
		.all(documentsPolicy.isAllowed)
		.post(documents.create);
		
	app.route('/api/profiles/:userId/documents')
		.all(documentsPolicy.isAllowed)
		.get(documents.list);
		
	app.route('/api/profiles/:userId/documents/:documentId')
		.all(documentsPolicy.isAllowed)
		.get(documents.read);

	// TODO: Refactor Existing routes which used this to use query params
	// app.route('/api/profiles/:userId/documents/:docType')
	// 	.get(function (req, res) {
	// 		return res.status(500).send({ message: 'Not implemented' });
	// 	});
   
	app.route('/api/documents/:documentId')
		.all(documentsPolicy.isAllowed)
		.get(documents.read)
		.put(documents.update)
		.delete(documents.delete);

	// Finish by binding the Document middleware
	app.param('documentId', documents.documentByID);
};
