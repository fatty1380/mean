'use strict';

var should      = require('should'),
    _           = require('lodash'),
    mongoose    = require('mongoose'),
    User        = mongoose.model('User'),
    Company     = mongoose.model('Company'),
    Job         = mongoose.model('Job'),
    Application = mongoose.model('Application'),
    Q           = require('q'),
    request     = require('supertest-as-promised')(Q.Promise),
    path        = require('path'),
    stubs       = require(path.resolve('./config/lib/test.stubs')),
    express     = require(path.resolve('./config/lib/express')),
    log         = require(path.resolve('./config/lib/logger')).child({
        module: 'applications',
        file  : 'routes.test'
    });

/**
 * Globals
 */
var app, agent, application, credentials, cUser, dUser, article, company, job, _test;

function signin() {

    log.trace({func: 'signin', credentials: credentials}, 'START');

    return agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .then(function (signinRes) {
            log.trace({func: 'signin'}, 'Login Complete');
            return signinRes;
        })
        .catch(function (signinErr) {
            // Handle signin error
            log.error({error: signinErr}, 'Signin Failed');

            return Q.reject(signinErr);
        });
}

/**
 * Article routes tests
 */
describe('Applications CRUD tests', function () {
    before(function () {
        this.timeout(5000);
        // Get application
        app   = express.init(mongoose).http;
        agent = request.agent(app);
    });

    beforeEach(function () {
        this.timeout(10000);
        log.trace({func: 'beforeEach'}, 'START');

        company = new Company({
            name: 'Test Company',
            user: cUser
        });

        job = new Job({
            user       : cUser,
            company    : company,
            name       : 'Job Title Name',
            description: 'Describe Me'
        });

        dUser = new User(stubs.users.driver);
        cUser = new User(_.extend(stubs.users.owner, {company: company}));

        var u1 = new User(stubs.getUser());
        var a1 = new Application(stubs.getApplication(u1, company, job));

        credentials = stubs.credentials;

        // Save a user to the test db and create new article
        return Q.all([dUser.save(), cUser.save(), company.save(), job.save(), a1.save(), u1.save()])
            .then(function (results) {
                log.trace({func: 'beforeEach', results: results}, 'Saved initial users and company');
                application = stubs.getApplication(dUser, company, job);
            }, function (err) {
                log.error({func: 'beforeEach', error: err}, 'Local Applicant Save Failed');
                should.not.exist(err, err.message);
            });
    });

    describe('Anonymous Route Method Checks', function () {

        it('should not be able to create a new application', function () {
            _test = this.test;

            return agent.post('/api/applications')
                .send(application)
                .expect(401)
                .then(function (response) {
                    should.exist(response);
                    log.debug({test: _test.title, response: response}, 'Got Response');

                    response.should.have.property('statusCode', 401);
                    response.should.have.property('text');
                });
        });
    });

    describe('Logged in as Company Owner Method Checks', function () {
        beforeEach(function () {
            credentials.username = cUser.username;
            return signin();
        });

    });

    describe('Logged in as Driver/User Method Checks', function () {
        beforeEach(function () {
            credentials.username = dUser.username;
            return signin();
        });

        it('should be able to create a new application', function () {
            _test = this.test;
            return agent.post('/api/applications')
                .send(application)
                .expect(201)
                .then(function (response) {
                    response.should.have.property('body');
                    response.body.should.have.property('_id');
                });
        });

        it('should return their own application', function () {
            _test = this.test;

            return agent.get('/api/applications')
                .query({job: job.id})
                .expect(200)
                .then(function (response) {
                    log.debug({test: _test.title, response: response}, 'Got Query Response');
                    response.should.have.property('body');
                    response.body.should.have.property('length', 0);
                })
                .then(function () {
                    return (new Application(stubs.getApplication(dUser, company, job))).save();

                })
                .then(function () {

                    return agent.get('/api/applications')
                        .query({job: job.id})
                        .expect(200)
                        .then(function (response) {
                            log.debug({test: _test.title, response: response}, 'Got Query Response');
                            response.should.have.property('body');
                            response.body.should.have.property('length', 1);
                        });
                })

        });
    });

    afterEach(function (done) {

        return Q.all([User.remove(), Company.remove(), Application.remove()])
            .then(function () {
                done();
            });
    });
});
