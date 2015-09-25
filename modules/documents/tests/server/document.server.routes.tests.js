'use strict';

var should = require('should'),
    _ = require('lodash'),
    Q = require('q'),
    path = require('path'),
	fs = require('fs'),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    express = require(path.resolve('./config/lib/express')),
    request = require('supertest-as-promised')(Q.Promise),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'user',
        file: 'document.server.routes.test'
    });

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	LBDocument = mongoose.model('Document');
	
/**
 * Globals
 */
var app, agent, credentials, user, lbDocument;


/**
 * What should I be able to do with a documents API?
 * 
 * should be able to load all of _my_ documents
 * should be able to upload a new PDF document
 * should be able to upload a new Base64 Encoded Document
 * should be able to replace an existing document
 * should be able to rename an existing document
 * should be able to remove an existing document
 * 
 * should be able to grant access to an existing document
 * should not be able to access a document when not authenticated
 * should not be able to access a document unless access has been granted
 */

/**
 * Document routes tests
 */
describe('Document CRUD tests', function () {
	before(function (done) {
		// Get application - Sometimes it takes more than 2 seconds
		this.timeout(4000);
		app = express.init(mongoose).http;
		agent = request.agent(app);

		done();
	});

	beforeEach(function (done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Document
		user.save(function () {
			lbDocument = {
				name: 'Document Name',
				data: stubs.profileImage64
			};

			done();
		});
	});

	it('should be able to save Document instance if logged in', function (done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Get the userId
				var userId = user.id;

				// Save a new Document
				agent.post('/api/documents')
					.send(lbDocument)
					.expect(200)
					.end(function (documentSaveErr, documentSaveRes) {
						// Handle Document save error
						if (documentSaveErr) { done(documentSaveErr); }

						// Get a list of Documents
						agent.get('/api/documents')
							.end(function (documentsGetErr, documentsGetRes) {
								// Handle Document save error
								if (documentsGetErr) { done(documentsGetErr); }

								// Get Documents list
								var documents = documentsGetRes.body;

								// Set assertions
								(documents[0].user._id).should.equal(userId);
								(documents[0].name).should.match('Document Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Document instance if not logged in', function (done) {
		agent.post('/api/documents')
			.send(lbDocument)
			.expect(403)
			.end(function (documentSaveErr, documentSaveRes) {
				// Call the assertion callback
				done(documentSaveErr);
			});
	});

	it('should not be able to save Document instance if no name is provided', function (done) {
		// Invalidate name field
		lbDocument.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }
				// Save a new Document
				agent.post('/api/documents')
					.send(lbDocument)
					.expect(400)
					.end(function (documentSaveErr, documentSaveRes) {
						// Set message assertion
						(documentSaveRes.body.message).should.match('Please fill Document name');
						
						// Handle Document save error
						done(documentSaveErr);
					});
			});
	});

	it('should be able to update Document instance if signed in', function (done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Save a new Document
				agent.post('/api/documents')
					.send(lbDocument)
					.expect(200)
					.end(function (documentSaveErr, documentSaveRes) {
						// Handle Document save error
						if (documentSaveErr) { done(documentSaveErr); }

						// Update Document name
						lbDocument.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Document
						agent.put('/api/documents/' + documentSaveRes.body._id)
							.send(lbDocument)
							.expect(200)
							.end(function (documentUpdateErr, documentUpdateRes) {
								// Handle Document update error
								if (documentUpdateErr) { done(documentUpdateErr); }

								// Set assertions
								(documentUpdateRes.body._id).should.equal(documentSaveRes.body._id);
								(documentUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Documents if not signed in', function (done) {
		// Create new Document model instance
		var documentObj = new LBDocument(lbDocument);

		// Save the Document
		documentObj.save(function () {
			// Request Documents
			request(app).get('/api/documents')
				.end(function (req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Document if not signed in', function (done) {
		// Create new Document model instance
		var documentObj = new LBDocument(lbDocument);

		// Save the Document
		documentObj.save(function () {
			request(app).get('/api/documents/' + documentObj._id)
				.end(function (req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', lbDocument.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Document instance if signed in', function (done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Save a new Document
				agent.post('/api/documents')
					.send(lbDocument)
					.expect(200)
					.end(function (documentSaveErr, documentSaveRes) {
						// Handle Document save error
						if (documentSaveErr) { done(documentSaveErr); }

						// Delete existing Document
						agent.delete('/api/documents/' + documentSaveRes.body._id)
							.send(lbDocument)
							.expect(200)
							.end(function (documentDeleteErr, documentDeleteRes) {
								// Handle Document error error
								if (documentDeleteErr) { done(documentDeleteErr); }

								// Set assertions
								(documentDeleteRes.body._id).should.equal(documentSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Document instance if not signed in', function (done) {
		// Set Document user 
		lbDocument.user = user;

		// Create new Document model instance
		var documentObj = new LBDocument(lbDocument);

		// Save the Document
		documentObj.save(function () {
			// Try deleting Document
			request(app).delete('/api/documents/' + documentObj._id)
				.expect(403)
				.end(function (documentDeleteErr, documentDeleteRes) {
					// Set message assertion
					(documentDeleteRes.body.message).should.match('User is not authorized');

					// Handle Document error error
					done(documentDeleteErr);
				});

		});
	});

	afterEach(function (done) {
		User.remove().exec(function () {
			LBDocument.remove().exec(function () {
				done();
			});
		});
	});
});
