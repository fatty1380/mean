'use strict';

var should          = require('should'),
    _ = require('lodash'),
    mongoose        = require('mongoose'),
    User            = mongoose.model('User'),
    ReportApplicant = mongoose.model('ReportApplicant'),
    BGReport        = mongoose.model('BackgroundReport'),
    Q               = require('q'),
    request         = require('supertest-as-promised')(Q.Promise),
    path            = require('path'),
    express         = require(path.resolve('./config/lib/express')),
    stubs = require(path.resolve('./config/lib/test.stubs')),
    log             = require(path.resolve('./config/lib/logger')).child({
        module: 'bgchecks',
        file  : 'bgchecks.server.routes.test'
    });

/**
 * Globals
 */
var app, agent, credentials, user, article, report, localApplicant, statuses, endpoint;

function seedReports(user, done) {

    var remoteApplicantIndex = 1313;

    return Q.all(_.map(statuses, function (status) {

        var remoteStatus = status === 'PAID' ? 'UNKNOWN' : status;

        var rpt = new BGReport({
            'user': user,
            'remoteApplicantId': remoteApplicantIndex++,
            'paymentInfo': {
                'transactionId': '9tmph8',
                'success': true
            },
            'status': status,
            'statuses': [
                {
                    'sku': 'MVRDOM',
                    'value': remoteStatus
                }
            ],
            'remoteReportSkus': 'MVRDOM',
            'localReportSku': 'OUTSET_MVR'
        });

        return rpt.save();
    }))
        .then(
        function (results) {
            if (_.isFunction(done)) {
                done();
            }
            return results;
        }, function (err) {
            log.error(err, 'seed reports failed');
            if (_.isFunction(done)) {
                done(err);
            }
            return Q.reject(err);
        }
    );
}

/**
 * Article routes tests
 */
describe('BGCheck CRUD tests', function () {
    before(function (done) {
        // Get application
        app   = express.init(mongoose).http;
        agent = request.agent(app);

        done();
    });

    beforeEach(function () {
        this.timeout(10000);
        log.trace({func: 'beforeEach'}, 'START');

        statuses = ['UNKNOWN', 'PAID', 'SUBMITTED', 'INVOKED', 'ERRORED', 'RESPONDED', 'SUSPENDED', 'VALIDATED', 'REJECTED', 'QUEUED', 'FAILED', 'NEED_INFO', 'COMPLETED'];

        // Create user credentials
        credentials = {
            username: 'username',
            password: 'password'
        };

        // Create a new user
        user = new User({
            firstName  : 'Full',
            lastName   : 'Name',
            displayName: 'Full Name',
            email      : 'test@test.com',
            username   : credentials.username,
            password   : credentials.password,
            provider   : 'local',
            type       : 'driver'
        });

        report = new BGReport({
            user             : user,
            remoteId         : 93651,
            remoteApplicantId: 45958,
            localReportSku   : 'OUTSET_MVR',
            remoteReportSkus : 'MVRDOM'
        });

        localApplicant = new ReportApplicant({
            remoteId: 45958,
            user    : user,
            reports : [report]
        });

        // Save a user to the test db and create new article
        return user.save()
            .then(function (user) {
                log.trace({func: 'beforeEach', user: user}, 'Saved User');
                return report.save();
            })
            .then(function (report) {
                log.trace({func: 'beforeEach', report: report}, 'Saved BGReport');
                return localApplicant.save();
            }, function (err) {
                log.error({func: 'beforeEach', error: err}, 'Local Applicant Save Failed');
                should.not.exist(err, err.message);
            })
            .then(function (applicant) {
                log.trace({func: 'beforeEach', applicant: applicant}, 'Saved Applicant');
                return stubs.agentLogin(agent, credentials);
            }, function (err) {
                log.error({func: 'beforeEach', error: err}, 'Signin Failed');
                should.not.exist(err, err.message);
            });
    });

    var routes = {
        getReportTypes : '/api/reports/types',
        postReportTypes: '/api/reports/:remoteSystem/update',
        getReportDef   : '/api/reports/types/:sku',
        createReport   : '/api/reports/types/:sku/create',
        getApplicant   : '/api/users/:userId/driver/applicant',
        postApplicant: '/api/users/:userId/driver/applicant',

        listApplicants  : '/api/reports/applicants',
        getApplicantById: '/api/reports/applicants/:applicantId'
    };

    describe('Local Applicant methods', function () {
        it('should be able to lookup a report applicant', function () {
            var _test = this.test;
            var endpoint = '/api/reports/applicants/' + localApplicant.id;

            log.trace({test: _test.title, url: endpoint}, 'Making Request');

            return agent.get(endpoint)
                .then(function (applicantResponse) {
                    log.debug({result: applicantResponse}, 'Got Applicant Response from `%s`', endpoint);

                    applicantResponse.should.have.property('body');

                    var applicant = applicantResponse.body;

                    applicant.should.have.property('reports').and.have.length(1);

                    applicant.reports[0].should.have.property('remoteApplicantId');
                    applicant.reports[0].should.have.property('localReportSku');
                    applicant.reports[0].should.have.property('remoteReportSkus');
                });
        });
        it('should be able to look at report(s) status details');

        it('should get an empty applicant response when the remote applicant is inaccessible', function () {
            var _test = this.test;
            log.trace({test: _test.title, url: endpoint}, 'Making Request');
            localApplicant.remoteId = 99999;

            return localApplicant.save()
                .then(function (applicant) {
                    applicant.should.have.property('remoteId', 99999);

                    endpoint = '/api/users/' + user.id + '/driver/applicant';
                    log.trace({test: _test.title, url: endpoint}, 'Making Request');

                    return agent.get(endpoint).expect(200);
                })
                .then(function (applicantResponse) {
                    log.debug({result: applicantResponse}, 'Got Applicant Response from `%s`', endpoint);

                    applicantResponse.should.have.property('body');

                    var applicant = applicantResponse.body;

                    applicant.should.have.property('reports').and.have.length(1);

                    applicant.reports[0].should.have.property('remoteApplicantId');
                    applicant.reports[0].should.have.property('localReportSku');
                    applicant.reports[0].should.have.property('remoteReportSkus');


                });
        });
    });

    describe('Local Report Status Routes', function () {

        beforeEach(function (done) {
            seedReports(user).then(function (results) {
                done();
            });
        });

        it('should restrict to a logged in user');

        it('should be able to load an unfiltered list of bg reports', function (done) {
            var test = this.test;

            var endpoint = '/api/reports';

            log.trace({test: this.test.title, url: endpoint}, 'Making Request');

            agent.get(endpoint)
                .query({})
                .expect(200)
                .then(function (response) {
                    should.exist(response.body);
                    log.debug({test: test.title, body: response.body}, 'Response has a body property');

                    var body = response.body;

                    log.debug({test: test.title, length: response.body.length}, 'body with length');

                    body.should.have.property('length').and.be.equal(14);

                    done();
                })
                .catch(function (err) {
                    log.error({test: test.title, error: err}, 'Test failed due to error');

                    should.not.exist(err);
                    done();
                });
        });

        it('should be able to query for only complete reports', function (done) {
            var test = this.test;
            agent.get('/api/reports')
                .query({isComplete: true})
                .expect(200)
                .then(function (response) {
                    should.exist(response.body);
                    log.debug({
                        test: test.title,
                        resultLength: response.body.length
                    }, 'Looking at %d reports in response', response.body.length);

                    var reports = response.body;

                    _.each(reports, function (rpt) {
                        log.debug({test: test.title, isComplete: rpt.isComplete}, 'Inspecting Report');

                        rpt.isComplete.should.be.true;
                    });

                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should be able to query for only incomplete reports', function (done) {
            var test = this.test;
            agent.get('/api/reports')
                .query({isComplete: false})
                .expect(200)
                .then(function (response) {
                    should.exist(response.body);
                    log.debug({
                        test: test.title,
                        resultLength: response.body.length
                    }, 'Looking at %d reports in response', response.body.length);

                    var reports = response.body;

                    _.each(reports, function (rpt) {
                        log.debug({test: test.title, isComplete: rpt.isComplete}, 'Inspecting Report');

                        rpt.isComplete.should.be.false;
                    });

                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });

        it('should be able to load a single bg report');
    });

    describe('Complete Status Report Update', function() {
        this.timeout(60000);

        it('should run without a hitch on a vanilla setup', function(done) {
            var test = this.test;

            agent.get('/api/reports/update')
            .expect(200)
            .then(function(response) {
                    should.exist(response.body);

                    log.debug({
                        test: test.title,
                        response: response.body
                    }, 'Looking at a fresh response');

                    response.body.should.have.property('startCt');
                    response.body.should.have.property('newStatus');
                    response.body.should.have.property('addedData');
                    response.body.should.have.property('addedPDF');
                    response.body.should.have.property('errors').and.have.length(0);

                    done();
                })
            .catch(function(err) {
                    log.error({error: err}, 'Problem running Complete Status Update');
                    done(err);
                });
        });
    });

    describe('Report Status Methods and Routes', function () {

        // Set a 20s timeout since eVerifile is involved;
        // TODO: Mock? once stuff is figured out
        this.timeout(60000);  // OK: 60, because, slow

        it('should be able to get report statuses for a user', function (done) {
            var _test = this.test;

            var endpoint = '/api/users/' + user.id + '/reports';

            log.trace({test: _test.title, url: endpoint}, 'Making Request');

            // Save a new article
            agent.get(endpoint)
                .expect(200)
                .then(function (response) {
                    response.should.have.property('body');
                    var reportStatuses = response.body;

                    log.debug({result: reportStatuses}, 'Got Response from `%s`', endpoint);


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
