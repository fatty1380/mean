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
    read: ReadReportApplicant
});

/** Bound Router Middleware ------------------------------------------ **/
exports.applicantByID = applicantByID;


/** BEGIN : Implementation -------------------------------------------- **/


/** Router Middleware ------------------------------------------ **/

/**
 * Bgcheck middleware
 */

function applicantByID(req, res, next, id) {
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

    console.log('[UpserRemoteApplicant] SENSITIVE REMOVE: Form Data: $s', JSON.stringify(formData, undefined, 2));

    debugger; // check that request body has correct ssn/dlid s

    var message = 'Requesting user does not match applicant user';

    if (!req.user._id.equals(formApplicantRsrc.userId)) {
        message = message + ' (' + req.user._id + '!=' + formApplicantRsrc.userId + ')';
        console.error('[UpsertRemoteApplicant] %s', message);
        res.status(401).send({ message: message });
    }

    everifile.GetSession().then(
        function (session) {
            var upsertResponse;
            
            everifile.CreateApplicant(session, formData).then(
                function (applicantUpsertResponse) {
                    console.log('[UpsertRemoteApplicant] Got applicant response from eVerifile: %j', applicantUpsertResponse);

                    req.remoteApplicant = upsertResponse = applicantUpsertResponse;

                    if (applicantUpsertResponse.updated) {
                        return ReportApplicant.findOne({
                            'remoteId': applicantUpsertResponse.applicantId,
                            'remoteSystem': 'everifile'
                        }).exec();
                    }
                    else {
                        console.log('[UpsertRemoteApplicant] Continuing to next to save teh applicant ...');
                        next();
                    }


                },
                function (reject) {
                    console.log('[UpsertRemoteApplicant] Error response: %j', reject, reject);
                    next(reject);
                }).then(
                function (localApplicant) {
                    if (!localApplicant) {
                        return res.status(400).send({
                            message: 'Unable to find your data in our system',
                            response: upsertResponse
                        });
                    }

                    if (localApplicant.remoteId !== upsertResponse.applicantId) {
                        console.error('Mismatched remoteIds between %j and %j', upsertResponse, localApplicant);
                    }

                    res.json(localApplicant);
                    return;
                },
                function (err) {
                    return res.status(400).send({
                        message: 'Unable to find your data in our system',
                        response: upsertResponse
                    });
                });
        }, function (error) {
            console.log('[GetAllRemoteApplicants] failed due to error: %j', error);
            next(error);
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

    applicant.save(function (err) {
        if (err) {
            console.log('Saving ReportApplicant failed with error: %j', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err),
                error: err
            });
        }

        console.log('Successfully saved ReportApplicant: %j', applicant);

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

    everifile.GetSession().then(
        function (session) {
            everifile.GetAllApplicants(session).then(
                function (applicantModels) {
                    console.log('[GetAllRemoteApplicants] Got %d applicant models from eVerifile');

                    res.json(applicantModels);
                },
                function (reject) {
                    console.log('[GetAllRemoteApplicants] Error response: %j', reject, reject);
                    next(reject);
                }
                );
        }, function (error) {
            console.log('[GetAllRemoteApplicants] failed due to error: %j', error);
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
        query = { remoteId: id };
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

        log.trace({ func: 'GetReportApplicant', applicant: localApplicant }, 'Found Local Applicant');

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
 * should be created.
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
            everifile.GetApplicant(session, id).then(
                function (remoteApplicant) {

                    log.debug({ func: 'GetRemoteApplicantData' }, 'Got remoteApplicant info: %j', remoteApplicant);
                    req.remoteApplicant = remoteApplicant;
                    next();
                }
                ).catch(function (error) {
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

    log.trace({ func: 'ReportApplicant.read', applicant: req.applicant }, 'Returning Applicant');
    log.debug({ func: 'ReportApplicant.read', applicant: req.applicant.id }, 'Returning Applicant ID');

    res.json(req.applicant);
}

