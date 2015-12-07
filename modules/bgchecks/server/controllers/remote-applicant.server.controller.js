'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Bgcheck = mongoose.model('BackgroundReport'),
    ReportType = mongoose.model('ReportType'),
    ReportApplicant = mongoose.model('ReportApplicant'),
    q = require('q'),
    everifile = require('./everifile.server.service'),
    constants = require(path.resolve('./modules/core/server/models/outset.constants')),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    _ = require('lodash'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'bgchecks',
        file: 'remote-applicant.server.controller'
    });

_.extend(exports, {
    list: GetAllRemoteApplicants,
    create: UpsertRemoteApplicant,
    save: SaveNewApplicant,
    get: GetReportApplicant, /* Searches for local ReportApplicant and sets req.applicant */
    getRemote: GetRemoteApplicantData,
    read: ReadReportApplicant,
    readRemoteData: ReadRemoteApplicantData
});

/** Bound Router Middleware ------------------------------------------ **/
exports.applicantByID = applicantByID;


/** BEGIN : Implementation -------------------------------------------- **/


/** Router Middleware ------------------------------------------ **/

/**
 * Bgcheck middleware
 */

function applicantByID(req, res, next, id) {
    req.log.info({ func: 'applicantById', id: id }, 'Looking up applicant by ID');
    req.applicantId = id;
    ReportApplicant
        .findById(id)
        .exec(function (err, applicant) {
            if (err) {
                log.error(err, 'Failed to lookup applicant by Id %s', id);
                return next(err);
            }

            log.debug({ func: 'applicantById', applicant: applicant }, 'Found Applicant by ID');
            req.applicant = applicant;
            next();
        });
}

/**
 * Bgcheck authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.bgcheck.user.id === req.user.id) {
        return next();
    }
    else {
        return res.status(403).send('User is not authorized');
    }
};

/** SECTION : Applicants ---------------------------------------------------- */

/**
 * @alias applicant.create
 */
function UpsertRemoteApplicant(req, res, next) {

    var formApplicantRsrc = req.body;
    var formData = formApplicantRsrc.reportSource;

    req.log.debug({ func: 'GetAllRemoteApplicants', controller: 'remote-applicant', formData: formData }, 'Logging fromdata Input');

    //debugger; // check that request body has correct ssn/dlid s

    var message = 'Requesting user does not match applicant user';

    if (!req.user._id.equals(formApplicantRsrc.userId)) {
        message = message + ' (' + req.user._id + '!=' + formApplicantRsrc.userId + ')';
        req.log.error({ func: 'UpserRemoteApplicant', controller: 'remote-applicant', message: message }, 'Unable to continue - unauthorized');
        res.status(401).send({ message: message });
    }
    var upsertResponse;

    return everifile.GetSession()
        .then(
            function (session) {

                req.log.debug({ func: 'func', controller: 'remote-applicant', session: session }, 'Got eVerifile Session');

                return everifile.CreateApplicant(session, formData)
                    .catch(function (err) {
                        req.log.error({ func: 'UpsertRemoteApplicant', controller: 'remote-applicant', err: err }, 'Failed to create or update applicant');
                        return q.reject(err);
                    });
            })
        .then(
            function (createApplicantResponse) {
                req.log.debug({ func: 'UpserRemoteApplicant', controller: 'remote-applicant' },
                    'Got applicant response from eVerifile: %j', createApplicantResponse);

                req.remoteApplicant = upsertResponse = createApplicantResponse;

                if (createApplicantResponse.updated) {
                    return ReportApplicant.findOne({
                        'remoteId': createApplicantResponse.applicantId,
                        'remoteSystem': 'everifile'
                    }).exec();
                }
            })
        .then(
            function (localApplicant) {
                if (!localApplicant) {

                    if (!req.remoteApplicant) {
                        req.log.error({ func: 'UpsertRemoteApplicant', controller: 'remote-applicant' }, 'No Local Applicant Found');
                        return res.status(400).send({
                            message: 'Unable to find your data in our system',
                            response: upsertResponse
                        });
                    }

                    req.log.info({ func: 'UpsertRemoteApplicant', controller: 'remote-applicant', applicant: req.remoteApplicant }, 'No Local Applicant Found - Continuing to save a new applicant');
                    return next();
                }

                if (localApplicant.remoteId !== upsertResponse.applicantId) {
                    req.log.error({ func: 'UpsertRemoteApplicant', controller: 'remote-applicant' }, 'Mismatched remoteIds between %j and %j', upsertResponse, localApplicant);
                }

                res.json(localApplicant);
                return;
            })
        .catch(
            function (err) {
                req.log.error({ func: 'func', controller: 'GetAllRemoteApplicants-applicant', err: err }, 'failed due to error: %j', err);
                next(err);
            });
}

/**
 * @alias applicant.save
 */
function SaveNewApplicant(req, res, next) {

    var applicantId = req.remoteApplicant && req.remoteApplicant.applicantId;

    var applicant = new ReportApplicant({
        remoteId: applicantId,
        user: req.user
    });

    req.log.debug({ func: 'SaveNewApplicant', controller: 'remote-applicant', applicant: applicant }, 'Saving new applicant');

    applicant.save(function (err) {
        if (err) {
            req.log.error({ func: 'SaveNewApplicant', controller: 'remote-applicant' }, 'Saving ReportApplicant failed with error: %j', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err),
                error: err
            });
        }

        req.log.debug({ func: 'SaveNewApplicant', controller: 'remote-applicant' }, 'Successfully saved ReportApplicant: %j', applicant);

        applicant.remoteData = req.remoteApplicant;
        res.json(applicant);
    });
}

/**
 * @alias applicant.list
 */
function GetAllRemoteApplicants(req, res, next) {

    if (!req.user || !req.user.isAdmin) {
        var message = 'No User, No Deal - only admins here';
        console.error('[GetAllRemoteApplicants] %s', message);
        return res.status(404);
    }

    everifile.GetSession()
        .then(
            function (session) {
                everifile.GetAllApplicants(session).then(
                    function (applicantModels) {
                        req.log.debug({ func: 'GetAllRemoteApplicants', controller: 'remote-applicant' }, 'Got %d applicant models from eVerifile');

                        res.json(applicantModels);
                    },
                    function (reject) {
                        req.log.error({ func: 'GetAllRemoteApplicants', controller: 'remote-applicant' }, 'Error response: %j', reject, reject);
                        next(reject);
                    }
                    );
            }, function (error) {
                req.log.error({ func: 'GetAllRemoteApplicants', controller: 'remote-applicant' }, 'unable to get eVerifile Session due to error: %j', error);
                next(error);
            });
}

/**
 * @alias applicant.get
 */
function GetReportApplicant(req, res, next) {

    if (req.applicant && req.applicant instanceof ReportApplicant) {
        log.debug({ func: 'GetReportApplicant' }, 'Applicant already loaded');

        return ReportApplicant.populate(req.applicant, { path: 'reports' })
            .then(function (success) {
                log.trace({ func: GetReportApplicant }, 'Populated Reports');
                next();
            });
    }

    var query, id;

    if (!!(id = req.remoteApplicantId || req.query.remoteApplicantId)) {
        query = { remoteId: id };
    } else if (!!(id = req.applicantId || req.query.applicantId)) {
        query = { _id: id };
    } else if (req.userId) {
        query = { user: mongoose.Types.ObjectId(req.userId) };
    } else if (req.user) {
        query = { user: req.user._id };
    } else {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }

    log.debug({ func: 'GetReportApplicant', query: query }, 'Loading Applicant based on query');

    ReportApplicant.findOne(query)
        .populate('reports')
        .exec(function (err, localApplicant) {
            if (err) {
                log.error(err, 'Unable to find, or error while finding ReportApplicant via query %o', query);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            if (!localApplicant) {
                log.info({ func: 'GetReportApplicant' }, 'No Local Applicant Found');
                return next();
            }

            log.debug({ func: 'GetReportApplicant', applicant: localApplicant }, 'Found Local Applicant');

            req.applicant = localApplicant;
            next();
        });

}

/**
 * @alias applicant.getRemote
 *
 * In order to find a remote applicant, we must assume that we have saved that
 * data into the local collection of report applicants. If this is true, the object
 * req.applicant will be populated from the previous method: GetReportApplicant.
 *
 * If it is not populated, we will assume that no remote applicant exists and one
 * should be created (in a separate method)
 *
 * In the future, we may choose to search for applicants, but maybe not.
 */
function GetRemoteApplicantData(req, res, next) {
    if (!req.applicant && !req.remoteApplicantId) {
        var message = 'Cannot find applicant without access to existing remoteApplicantId';
        log.warn({ func: 'GetRemoteApplicantData' }, message);
        return next();
    }

    var id = req.remoteApplicantId || req.applicant && req.applicant.remoteId;

    if (req.remoteApplicantId) {
        log.debug({ func: 'GetRemoteApplicantData' }, 'Using req.remoteApplicantId remoteId source');
    } else if (id) {
        log.debug({ func: 'GetRemoteApplicantData' }, 'Using req.applicant for remoteId source');
    } else if (!id) {
        log.warn({ func: 'GetRemoteApplicantData' }, 'Unable to search for applicant from request data');
        req.remoteApplicant = null;
        return next();
    }

    return everifile.GetSession().then(
        function (session) {
            everifile.GetApplicant(session, id)
                .then(
                    function (remoteApplicant) {

                        log.debug({ func: 'GetRemoteApplicantData' }, 'Got remoteApplicant info: %j', remoteApplicant);
                        req.remoteApplicant = remoteApplicant;

                        next();
                    })
                .catch(function (error) {
                    log.debug({ func: 'GetRemoteApplicantData' }, 'failed due to error: %j', error);
                    if (error.status === 401) {
                        log.warn({ func: 'GetRemoteApplicantData' }, 'Value for remote applicant is invalid');

                        req.remoteApplicant = null;

                        next();
                    } else {
                        next(error);
                    }
                });
        }).catch(function (error) {
            log.error({ func: 'GetRemoteApplicantData', error: error }, 'Unable to get remote session: %j', error);
            next(error);
        });
}

/**
 * @alias applicant.read
 *
 * Reads and returns the ReportApplcant from the response;
 */
function ReadReportApplicant(req, res) {

    if (!req.applicant) {
        return res.status(404).send({
            message: 'No local applicant found'
        });
    }

    log.trace({ func: 'ReportApplicant.read', applicant: req.applicant }, 'Returning Applicant `%s`', req.applicant.id);
    log.debug({ func: 'ReportApplicant.read', applicant: req.applicant.id }, 'Returning Applicant `%s`', req.applicant.id);

    res.json(req.applicant);
}
/**
 * @alias applicant.readRemoteData
 *
 * Reads and returns the RemoteData from the response;
 */
function ReadRemoteApplicantData(req, res) {

    if (!req.applicant) {
        return res.status(404).send({
            message: 'No remote applicant data found'
        });
    }

    log.trace({ func: 'RemoteApplicant.read', applicant: req.remoteApplicant }, 'Returning Remote Applicant `%s`', req.remoteApplicant && req.remoteApplicant.id);
    log.debug({ func: 'RemoteApplicant.read', applicant: req.remoteApplicant && req.remoteApplicant.id }, 'Returning Remote Applicant `%s`', req.remoteApplicant && req.remoteApplicant.id);

    res.json(req.remoteApplicant);
}

