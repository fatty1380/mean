'use strict';

var should      = require('should'),
    _           = require('lodash'),
    mongoose    = require('mongoose'),
    User        = mongoose.model('User'),
    Company     = mongoose.model('Company'),
    Driver     = mongoose.model('Driver'),
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

var cu2, c2, j2, a2;

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

        dUser = new Driver(stubs.user);

        company = new Company({
            name: 'Test Company'
        });
        cUser = new User(_.extend(stubs.owner, { company: company._id }));
        company.owner = cUser._id;
        
        c2 = new Company({name: 'Not your Company', user: cu2});
        cu2 = new User(stubs.getUser());
        c2.owner = cu2._id;

        job = new Job({
            user       : cUser,
            company    : company,
            name       : 'Job Title Name',
            description: 'Describe Me'
        });

        j2 = new Job({user: cu2, company: c2, name: 'Other Job Title', description: 'You Wish'});
        a2 = new Application(stubs.getApplication(cu2, c2, j2));

        credentials = stubs.credentials;

        // Save a user to the test db and create new article
        return Q.all([dUser.save(), cUser.save(), company.save(), job.save(), j2.save(), a2.save(), cu2.save(), c2.save()])
            .then(function (results) {
                log.trace({func: 'beforeEach', results: results}, 'Saved initial users and company');
                application = new Application(stubs.getApplication(dUser, company, job));
            }, function (err) {
                log.error({func: 'beforeEach', error: err}, 'Local Applicant Save Failed');
                should.not.exist(err, err.message);
            });
    });

    describe('Anonymous Route Method Checks', function () {

        it('should not be able to create a new application', function () {
            var data = stubs.getApplication(dUser, company, job);
            _test    = this.test;

            return agent.post('/api/applications')
                .send(data)
                .expect(401)
                .then(function (response) {
                    should.exist(response);
                    log.trace({test: _test.title, response: response}, 'Got Response');

                    response.should.have.property('statusCode', 401);
                    response.should.have.property('text');
                });
        });

        it('should not be able to list any applications');
        it('should not be able to get any applications', function () {
            it('... by id');
            it('... by job');
            it('... by company');
            it('... by user');
        });
    });

    describe('Logged in as Company Owner Method Checks', function () {
        beforeEach(function () {
            credentials.username = cUser.username;
            return application.save().then(function () {
                return stubs.agentLogin(agent, credentials);
            });
        });

        it('should only return applications to their own jobs when listing all', function () {
            _test = this.test;

            return agent.get('/api/applications')
                .expect(200)
                .then(function (response) {
                    log.debug({test: _test.title, response: response}, 'Got Query Response');
                    response.should.have.property('body');

                    var applications = response.body;

                    _.each(applications, function (application) {
                        application.should.have.property('company');
                        application.company.should.have.property('id', company.id);
                        application.should.have.property('status');
                        application.should.not.containDeep({status: 'draft'});
                        application.should.not.containDeep({status: 'rejected'});
                    });

                    applications.should.have.property('length', 1);
                });
        });
        it('should be able to load an application to their job', function () {
            _test = this.test;
        });
        it('should not be able to load an application to someone elses job', function () {
            _test = this.test;

            return agent.get('/api/applications/' + a2.id)
                .expect(403)
                .then(function (response) {
                    response.should.have.property('status', 403);
                });
        });

        it('should be able to set the status via a patch call', function () {
            _test        = this.test;
            var endpoint = '/api/applications/' + application.id;

            var patch = {status: 'read'};

            return agent.patch(endpoint)
                .send(patch)
                .expect(200)
                .then(function (response) {
                    response.should.have.property('body');

                    response.body.should.have.property('status', patch.status);
                    response.body.should.have.property('_id');
                });

        });

        it('should not be able to see DRAFT applications in results', function () {
            _test        = this.test;
            var endpoint = '/api/applications';

            application.status = 'draft';

            return application.save()
                .then(function () {
                    return agent.get(endpoint)
                        .expect(200);
                })
                .then(function (response) {

                    _.each(response.body, function (application) {
                        application.status.should.not.match(/draft|rejected/);
                    });
                });
        });

        it('should be able to query for specific status only, and not see draft', function () {
            _test        = this.test;
            var endpoint = '/api/applications';

            application.status = 'draft';
            var a = new Application(new Application(stubs.getApplication(cu2, company, job)));
            a.status='submitted';

            return Q.all(application.save(), a.save())
                .then(function () {
                    return agent.get(endpoint)
                        .query({status: 'submitted'})
                        .expect(200);
                })
                .then(function (response) {

                    _.each(response.body, function (application) {
                        application.status.should.match(/submitted/);
                    });
                });
        });

    });

    describe('Logged in as Driver/User Method Checks', function () {
        beforeEach(function () {
            credentials.username = dUser.username;
            return stubs.agentLogin(agent, credentials);
        });

        it('should be able to create a new application', function () {
            _test    = this.test;
            var data = stubs.getApplication(dUser, company, job);

            return agent.post('/api/applications')
                .send(data)
                .expect(201)
                .then(function (response) {
                    response.should.have.property('body');
                    response.body.should.have.property('_id');
                });
        });

        it('should not be able to load someone elses application', function () {
            _test = this.test;

            return agent.get('/api/applications/' + a2.id)
                .expect(403)
                .then(function (response) {
                    response.should.have.property('status', 403);
                });
        });

        describe('with an existing application', function () {

            beforeEach(function () {
                application = new Application(stubs.getApplication(dUser, company, job));

                return application.save();
            });

            it('should return their own application', function () {
                _test = this.test;

                return agent.get('/api/applications')
                    .query({job: job.id})
                    .expect(200)
                    .then(function (response) {
                        log.debug({test: _test.title, response: response}, 'Got Query Response');
                        response.should.have.property('body');
                        response.body.should.have.property('length', 1);

                        var app = response.body[0];

                        app.user.should.have.property('id', dUser.id);

                    });

            });
        });
    });

    afterEach(function (done) {

        return Q.all([User.remove(), Company.remove(), Application.remove()])
            .then(function () {
                done();
            });
    });
});
