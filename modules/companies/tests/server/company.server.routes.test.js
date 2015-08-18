'use strict';

var should = require('should'),
	Q = require('q'),
	request = require('supertest-as-promised')(Q.Promise),
	path = require('path'),
	express = require(path.resolve('./config/lib/express')),
	stubs = require(path.resolve('./config/lib/test.stubs')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'tests',
        file: 'feed.server.routes'
    });

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Company = mongoose.model('Company');
	
/**
 * Globals
 */
var app, agent, credentials, user, target, owner, company;

/**
 * Company routes tests
 */
describe('Company CRUD tests', function () {
	before(function (done) {
		log.debug({ func: 'beforeAll' }, 'Setup Base');
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app.http);

		done();
	});

	beforeEach(function () {
		log.debug({ func: 'beforeEach' }, 'Setup');

        user = new User(stubs.user);
        credentials = stubs.getCredentials(user);
		
		owner = new User(stubs.owner);

		// Save a user to the test db and create new Feed
		//return Q.all([user.save(), feed.save()]).then(
		return Q.all([user.save(), owner.save(), target.save()]).then(
			function () {
				company = stubs.getCompany(owner);
			});
	});
	 
	/**
	 * End Stubs
	 */

	it('should be able to save Company instance if logged in', function (done) {
		stubs.agentLogin(agent, credentials).then(function () {

			log.debug({ func: 'save' }, 'Setup');
			// Get the userId
			var userId = user.id;

			// Save a new Company
			agent.post('/api/companies')
				.send(company)
				.expect(200)
				.end(function (companySaveErr, companySaveRes) {
					// Handle Company save error
					if (companySaveErr) { done(companySaveErr); }

					// Get a list of Companies
					agent.get('/api/companies')
						.end(function (companiesGetErr, companiesGetRes) {
							// Handle Company save error
							if (companiesGetErr) { done(companiesGetErr); }

							// Get Companies list
							var companies = companiesGetRes.body;

							// Set assertions
							(companies[0].user._id).should.equal(userId);
							(companies[0].name).should.match('My Company Name');

							// Call the assertion callback
							done();
						});
				});
		});
	});

	it('should not be able to save Company instance if not logged in', function (done) {
		agent.post('/api/companies')
			.send(company)
			.expect(403)
			.end(function (companySaveErr, companySaveRes) {
				// Call the assertion callback
				done(companySaveErr);
			});
	});

	it('should not be able to save Company instance if no name is provided', function (done) {
		// Invalidate name field
		company.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/api/companies')
					.send(company)
					.expect(400)
					.end(function (companySaveErr, companySaveRes) {
						// Set message assertion
						(companySaveRes.body.message).should.match('Please fill Company name');
						
						// Handle Company save error
						done(companySaveErr);
					});
			});
	});

	it('should be able to update Company instance if signed in', function (done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/api/companies')
					.send(company)
					.expect(200)
					.end(function (companySaveErr, companySaveRes) {
						// Handle Company save error
						if (companySaveErr) { done(companySaveErr); }

						// Update Company name
						company.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Review
						agent.put('/api/companies/' + companySaveRes.body._id)
							.send(company)
							.expect(200)
							.end(function (companyUpdateErr, companyUpdateRes) {
								// Handle Company update error
								if (companyUpdateErr) { done(companyUpdateErr); }

								// Set assertions
								(companyUpdateRes.body._id).should.equal(companySaveRes.body._id);
								(companyUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Companies if not signed in', function (done) {
		// Create new Company model instance
		var companyObj = new Company(company);

		// Save the Review
		companyObj.save(function () {
			// Request Companies
			request(app).get('/api/companies')
				.end(function (req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Company if not signed in', function (done) {
		// Create new Company model instance
		var companyObj = new Company(company);

		// Save the Review
		companyObj.save(function () {
			request(app).get('/api/companies/' + companyObj._id)
				.end(function (req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', company.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Company instance if signed in', function (done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function (signinErr, signinRes) {
				// Handle signin error
				if (signinErr) { done(signinErr); }

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/api/companies')
					.send(company)
					.expect(200)
					.end(function (companySaveErr, companySaveRes) {
						// Handle Company save error
						if (companySaveErr) { done(companySaveErr); }

						// Delete existing Review
						agent.delete('/api/companies/' + companySaveRes.body._id)
							.send(company)
							.expect(200)
							.end(function (companyDeleteErr, companyDeleteRes) {
								// Handle Company error error
								if (companyDeleteErr) { done(companyDeleteErr); }

								// Set assertions
								(companyDeleteRes.body._id).should.equal(companySaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Company instance if not signed in', function (done) {
		// Set Company user 
		company.user = user;

		// Create new Company model instance
		var companyObj = new Company(company);

		// Save the Review
		companyObj.save(function () {
			// Try deleting Review
			request(app).delete('/api/companies/' + companyObj._id)
				.expect(403)
				.end(function (companyDeleteErr, companyDeleteRes) {
					// Set message assertion
					(companyDeleteRes.body.message).should.match('User is not authorized');

					// Handle Company error error
					done(companyDeleteErr);
				});

		});
	});

	afterEach(function (done) {
		User.remove().exec(function () {
			Company.remove().exec(function () {
				done();
			});
		});
	});
});
