'use strict';

var should = require('should'),
    request = require('supertest'),
    path = require('path'),
    mongoose = require('mongoose'),
    Bgcheck = mongoose.model('BackgroundReport'),
    ReportType = mongoose.model('ReportType'),
    ReportApplicant = mongoose.model('ReportApplicant'),
    path = require('path'),
    express = require(path.resolve('./config/lib/express')),
    config = require(path.resolve('./config/config')),
    everifile = require(path.resolve('./modules/bgchecks/server/controllers/everifile.server.service'));

/**
 * Globals
 */
var app, agent, credentials, applicant, article, session;


/**
 * Article routes tests
 */
describe('Everifile CRUD tests', function (done) {
    this.timeout(10000);
    this.slow(500);

    beforeEach(function () {

        applicant = {
            'middleName': '',
            'lastName': 'Johnson',
            'nameSuffix': '',
            'driversLicense': '',
            'applicantId': 45958,
            'aliases': [{'lastName': 'Smith', 'firstName': 'Dominique'}],
            'driversLicenseState': 'arizona',
            'currentAddress': {
                'street2': 'C421',
                'street1': '1081 N Parkside Dr',
                'postalCode': '85281',
                'state': 'arizona',
                'country': 'united_states',
                'city': 'Tempe'
            },
            'governmentId': '',
            'gender': 'female',
            'birthDate': '19910626',
            'firstName': 'Ashley',
            'remoteId': 45958
        };

        return everifile.GetSession()
            .then(function (sessionResponse) {
                session = sessionResponse;
            })
            .catch(function (err) {
                console.error('Error Initializing tests ', err);
                should.not.exist(err);
            });
    });

    it('should have an active login token', function (done) {

        should.exist(session);
        should.exist(session.jar);

        done();
    });

    describe('Basic Applicant Functions', function () {

        it('should be able to get a list of all applicants', function (done) {

            this.slow(60000);
            this.timeout(120000); // 60s Timeout for this test

            everifile.GetAllApplicants(session)
                .then(function (applicantList) {
                    should.exist(applicantList);

                    applicantList.should.have.property('length');
                    applicantList.length.should.be.above(0);

                    var applicant = applicantList[0];

                    applicant.should.have.property('firstName');
                    applicant.should.have.property('lastName');
                    applicant.should.have.property('applicantId');
                    applicant.should.have.property('governmentId', '');
                })
                .catch(function (err) {
                    should.not.exist(err);
                })
                .finally(function () {
                    done();
                });
        });

        it('should be able to retrieve ApplicantId 45958 (Ashley Johnson)', function (done) {
            var applicantId = '45958';

            everifile.GetApplicant(session, applicantId)
                .then(function (applicant) {
                    should.exist(applicant);

                    applicant.should.have.property('applicantId', applicant.applicantId);
                    applicant.should.have.property('driversLicense', '');
                    applicant.should.have.property('governmentId', '');
                    applicant.should.have.property('driversLicenseState', applicant.driversLicenseState);
                    applicant.should.have.property('currentAddress', applicant.currentAddress);
                    applicant.should.have.property('birthDate', applicant.birthDate);

                    console.log('Applicant Returned: %j', applicant);
                })
                .catch(function (err) {
                    should.not.exist(err);
                })
                .finally(function () {
                    done();
                });
        });

        it('should be able to retrieve ApplicantId 45958 (Ashley Johnson) with sensitive data', function (done) {
            var applicantId = '45958';

            everifile.GetApplicant(session, applicantId, true)
                .then(function (applicant) {
                    should.exist(applicant);

                    applicant.should.have.property('driversLicense');
                    applicant.should.have.property('governmentId').with.length(9);
                })
                .catch(function (err) {
                    should.not.exist(err);
                })
                .finally(function () {
                    done();
                });
        });

        describe.skip('Search/Find Applicant', function () {
            this.timeout(45000);

            it('should be able to find by govid', function (done) {
                applicant = {
                    governmentId: 111111111
                };

                everifile.SearchForApplicant(session, applicant)
                    .then(function (applicant) {
                        should.exist(applicant);

                        applicant.should.have.property('firstName', 'Joe');
                        applicant.should.have.property('lastName', 'Walkthrough');
                        applicant.should.have.property('applicantId', 62595);
                    })
                    .catch(function (err) {
                        should.not.exist(err);
                    })
                    .finally(function () {
                        done();
                    });
            });

            it('should not able to find without a gov ID', function (done) {
                applicant = {
                    firstName: 'Walkthrough',
                    lastName: 'Joe'
                };

                everifile.SearchForApplicant(session, applicant)
                    .then(function (applicant) {
                        should.not.exist(applicant);
                    })
                    .catch(function (err) {
                        should.exist(err);
                    })
                    .finally(function () {
                        done();
                    });
            });
        });


        it('should be able to create a new applicant');

        it('should be able to update an existing applicant');

    });

    describe('Report Status and Creation Functionality', function () {

        //ReportStatus = {
        //    'reports': [{
        //        'id': 93651,
        //        'startDate': 1421384400000,
        //        'completedDate': 1421691798000,
        //        'report': {'sku': 'MVRDOM'},
        //        'reportCheckStatus': {'timestamp': 1421691798000, 'status': 'COMPLETED'}
        //    }], 'applicant': {'id': 45958}
        //}

        describe('Report Creation for Existing Applicant', function () {
            it('should allow the ordering/creation of a report for a new applicant');
        });


        describe('Report Status Checks (by ReportID)', function () {

            it('should be able to get report status for a specific report ID', function (done) {
                var expected = {
                    'id': 93651,
                    'startDate': 1421384400000,
                    'completedDate': 1421691798000,
                    'applicant': {'id': 45958},
                    'report': {'sku': 'MVRDOM'},
                    'reportCheckStatus': {'timestamp': 1421691798000, 'status': 'COMPLETED'}
                };

                var reportId = 93651;

                everifile.GetReportStatus(session, reportId)
                    .then(function (reportStatus) {

                        console.log('ReportStatus: %j', reportStatus);

                        should.exist(reportStatus);

                        reportStatus.should.have.property('applicant', expected.applicant);
                        reportStatus.should.have.property('report', expected.report);
                        reportStatus.should.have.property('reportCheckStatus');

                        reportStatus.reportCheckStatus.should.have.property('status', 'COMPLETED');
                    })
                    .catch(function (err) {
                        should.not.exist(err);
                    })
                    .finally(function () {
                        done();
                    });
            });

        });


        describe('Report Status Checks (by Applicant)', function () {

            it('should be able to Get a basic Report Status for an applicant', function (done) {
                everifile.GetReportStatusByApplicant(session, applicant.applicantId)
                    .then(function (reportStatuses) {
                        should.exist(reportStatuses);

                        reportStatuses.should.have.property('reports').with.length.greaterThan(0);
                        reportStatuses.should.have.property('applicant', {'id': 45958});
                        reportStatuses.should.have.property('report', {'sku': 'MVRDOM'});

                    })
                    .catch(function (err) {
                        should.not.exist(err);
                    })
                    .finally(function () {
                        done();
                    });
            });


            it('Should find no report statuses for user 62595', function (done) {
                everifile.GetReportStatusByApplicant(session, 62595)
                    .then(function (reportStatus) {
                        should.exist(reportStatus);

                        reportStatus.should.have.property('reports').with.length(0);
                        reportStatus.should.have.property('applicant', {'id': 62595});
                    })
                    .catch(function (err) {
                        should.not.exist(err);
                    })
                    .finally(function () {
                        done();
                    });
            });


            it('Should fail for inaccessible Remote ID', function (done) {
                everifile.GetReportStatusByApplicant(session, 99999)
                    .then(function (reportStatus) {
                        should.not.exist(reportStatus);
                    })
                    .catch(function (err) {
                        should.exist(err);
                    })
                    .finally(function () {
                        done();
                    });
            });
        });

        describe('Report Data Gathering', function () {
            var expected = {
                id: 93651,
                response: {
                    universal: {
                        isComplete: true,
                        xmlData: '<xmlData><reportInfo xmlns:date="http://exslt.org/dates-and-times">...</reportInfo><applicantInfo xmlns:date="http://exslt.org/dates-and-times">...</applicantInfo><motorVehicleSearches xmlns:date="http://exslt.org/dates-and-times">...</motorVehicleSearches>\n</xmlData>',
                        reportDisplayData: [Object]
                    }
                },
                startDate: 1421384400000,
                completedDate: 1421691798000,
                report: {sku: 'MVRDOM'},
                applicant: {id: 45958},
                reportCheckStatus: {timestamp: 1421691798000, status: 'COMPLETED'}
            };

            it('should be able to get the raw report data (by report ID)', function (done) {
                everifile.GetRawReport(session, 93651)
                    .then(function (reportData) {
                        should.exist(reportData);

                        reportData.should.have.property('response');
                        reportData.response.should.have.property('universal');
                        reportData.response.universal.should.have.property('isComplete').and.be.true();
                        reportData.response.universal.should.have.property('xmlData').and.have.length().greaterThan(50);
                        reportData.response.universal.should.have.property('reportDisplayData');


                    })
                    .catch(function (err) {
                        should.not.exist(err);
                    })
                    .finally(function () {
                        done();
                    });

            });

            it('should throw an error for a non-existing report ID', function (done) {
                everifile.GetRawReport(session, 99999)
                    .then(function (reportData) {
                        should.not.exist(reportData);
                    })
                    .catch(function (err) {
                        should.exist(err);
                    })
                    .finally(function () {
                        done();
                    });

            });

            describe('PDF Reports', function() {
                it('should be able to get the PDF (by report ID)', function (done) {
                    everifile.GetSummaryReportPDF(session, 93651)
                        .then(function (reportDataPDF) {
                            should.exist(reportDataPDF);

                            reportDataPDF.should.have.property('headers');
                            reportDataPDF.should.have.property('contentType');
                            reportDataPDF.should.have.property('date');
                            reportDataPDF.should.have.property('filename');
                            reportDataPDF.should.have.property('type');
                            reportDataPDF.should.have.property('response');
                        })
                        .catch(function (err) {
                            should.not.exist(err);
                        })
                        .finally(function () {
                            done();
                        });

                });

                it('should throw an error for a non-existing report ID', function (done) {
                    everifile.GetSummaryReportPDF(session, 99999)
                        .then(function (reportDataPDF) {
                            should.not.exist(reportDataPDF);
                        })
                        .catch(function (err) {
                            should.exist(err);
                        })
                        .finally(function () {
                            done();
                        });

                });
            });


        });

    });


    afterEach(function (done) {

        done();
    });
});
