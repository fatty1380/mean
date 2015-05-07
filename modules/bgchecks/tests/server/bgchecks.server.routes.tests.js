'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ReportApplicant = mongoose.model('ReportApplicant'),
    BGReport = mongoose.model('BackgroundReport'),
    Q = require('q'),
    request = require('supertest-as-promised')(Q.Promise),
    path = require('path'),
    express = require(path.resolve('./config/lib/express')),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'bgchecks.routes.test',
        file: 'bgchecks.server.routes.test'
    });

/**
 * Globals
 */
var app, agent, credentials, user, article, report, localApplicant;

function signin(done) {
    log.trace({func: 'signin', credentials: credentials}, 'START');

    return agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .then(function (signinRes) {
            log.trace({func: 'signin'}, 'Login Complete');

            done();
        })
        .catch(function (signinErr) {
            // Handle signin error
            log.error({error: signinErr}, 'Signin Failed');
            done(signinErr);
        });
}

/**
 * Article routes tests
 */
describe('BGCheck CRUD tests', function () {
    before(function (done) {
        // Get application
        app = express.init(mongoose).http;
        agent = request.agent(app);

        done();
    });

    beforeEach(function (done) {
        this.timeout(10000);
        log.trace({func: 'beforeEach'}, 'START');

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
            provider: 'local',
            type: 'driver'
        });

        report = new BGReport({
            user: user,
            remoteId: 93651,
            remoteApplicantId: 45958,
            localReportSku: 'OUTSET_MVR',
            remoteReportSkus: 'MVRDOM'
        });

        localApplicant = new ReportApplicant({
            remoteId: 45958,
            user: user,
            reports: [report]
        });

        // Save a user to the test db and create new article
        user.save()
            .then(function (user) {
                log.trace({func: 'beforeEach', user: user}, 'Saved User');
                return report.save();
            })
            .then(function (report) {
                log.trace({func: 'beforeEach', report:report}, 'Saved BGReport');
                return localApplicant.save();
            }, function (err) {
                log.error({func: 'beforeEach', error: err}, 'Local Applicant Save Failed');
                should.not.exist(err, err.message);
            })
            .then(function (applicant) {
                log.trace({func: 'beforeEach', applicant: applicant}, 'Saved Applicant');
                return signin(done);
            }, function (err) {
                log.error({func: 'beforeEach', error: err}, 'Signin Failed');
                should.not.exist(err, err.message);
            });
    });

    var routes = {
        getReportTypes: '/api/reports/types',
        postReportTypes: '/api/reports/:remoteSystem/update',
        getReportDef: '/api/reports/types/:sku',
        createReport: '/api/reports/types/:sku/create',
        getApplicant: '/api/users/:userId/driver/applicant',
        postApplicant: '/apid/users/:userId/driver/applicant',

        listApplicants: '/api/reports/applicants',
        getApplicantById: '/api/reports/applicants/:applicantId'


    };

    describe('Report Status Methods and Routes', function () {

        // Set a 20s timeout since eVerifile is involved;
        // TODO: Mock? once stuff is figured out
        this.timeout(60000);  // OK: 60, because, slow

        it('should be able to get report statuses for a user', function (done) {

            var endpoint = '/api/users/' + user.id + '/reports';

            log.trace({url: endpoint}, 'Making Request');

            // Save a new article
            agent.get(endpoint)
                .expect(200)
                .then(function (articleResult) {
                    log.debug({result: articleResult}, 'Got Response from /api/reports');

                    done();
                })
                .catch(function (err) {
                    log.error(err, 'Error getting reports');
                    done(err);
                });
        });

        it('should be able to check the report status for a specific remote applicant');

        it('should be able to load the PDF contents of a report');
        it('should be able to ');

        it('should be able to save an article if logged in');
    });


    afterEach(function (done) {
        User.remove()
            .then(function () {
                return BGReport.remove();
            })
            .then(function () {
                return ReportApplicant.remove();
            })
            .then(function () {
                done();
            });
    });
});
