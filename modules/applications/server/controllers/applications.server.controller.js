'use strict';

/**
 * Module dependencies.
 */
var mongoose     = require('mongoose'),
    Q            = require('q'),
    path         = require('path'),
    Application  = mongoose.model('Application'),
    Release      = mongoose.model('Release'),
    Message      = mongoose.model('Message'),
    User         = mongoose.model('User'),
    Job          = mongoose.model('Job'),
    Connection   = mongoose.model('Connection'),
    log          = require(path.resolve('./config/lib/logger')).child({
        module: 'applications',
        file  : 'Applications.Controller'
    }),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    emailer      = require(path.resolve('./modules/emailer/server/controllers/emailer.server.controller')),
    releaseDocs  = require(path.resolve('./modules/applications/server/controllers/release-documents.server.controller')),
    moment       = require('moment'),
    _            = require('lodash');

exports.create = create;
exports.read   = read;
exports.update = update;
exports.patch  = patchUpdate;
exports.delete = remove;

exports.executeQuery = executeQuery;

exports.applicationByID  = applicationByID;
exports.queryByUserID    = queryByUserID;
exports.loadMine         = loadMine;
exports.getByJobId       = getByJobId;
exports.queryByJobID     = queryByJobId;
exports.queryByCompanyID = queryByCompanyId;

/**
 * "Instance" Methods
 */

function executeQuery(req, res) {

    var query = req.query || {};
    var sort  = req.sort || '-created';

    if (!req.user.isAdmin) {
        if (req.user.isDriver) {
            log.trace({
                func: 'executeQuery',
                user: req.user.id
            }, 'Restricting query by user');
            query.user = req.user.id;
        } else if (req.user.isOwner) {
            log.trace({
                func   : 'executeQuery',
                company: req.user.company
            }, 'Restricting query by Company');
            query.company = req.user.company;
        }
        log.debug({
            func : 'executeQuery',
            query: {user: query.user, company: query.company},
            user : req.user
        }, 'Restricting query based on user type');
    }

    req.log.debug({query: query}, 'Querying DB For Applications');

    var populate = (req.populate || ['job', 'connection', 'messages']).join(' ');

    Application.find(query)
        .sort(sort)
        .populate('user', 'displayName profileImageURL')
        .populate('company', 'name profileImageURL')
        .populate(populate)
        .exec(function (err, applications) {
            if (err) {
                req.log.error('Failed to load applications from query', {error: err, query: query});
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.applications = applications || [];
            req.log.debug('[ApplicationsCtrl.executeQuery] Found %d applications for query %j (%s)', req.applications.length, query, req.url);

            res.json(req.applications);
        });
}

function processDocuments(req, application) {
    return _.map(application.releases, function (release) {
        if (_.isEmpty(release.file) || moment(release.signature.timestamp).isAfter(release.modified)) {
            req.log.info('update', 'Saving file to cloud');
            var newRelease = new Release(release);
            return releaseDocs.generateDocument(newRelease, req.user);
        }

        req.log.info('update', 'File has already been saved to cloud');
        return Q.when(release);
    });
}

/**
 * Create a Application
 */
function create(req, res) {

    var jobId = req.job && req.job.id || req.body.job && req.body.job.id || req.body.jobId || req.query.jobId;
    req.log.trace({
        func   : 'create',
        job    : req.job,
        bodyJob: req.body.job,
        bodyId : req.body.jobId,
        query  : req.query
    }, 'Creating application for job %s', jobId);

    if (_.isEmpty(jobId)) {
        req.log.error({
            func   : 'create',
            job    : req.job,
            bodyJob: req.body.job,
            bodyId : req.body.jobId,
            query  : req.query
        }, 'Cannot create an application without a job to attach it to', {
            job    : req.job,
            bodyJob: req.body.job,
            bodyId : req.body.jobId,
            query  : req.query
        });
        return res.status(400).send({
            message: 'Must specify which job this application is for'
        });
    }

    var application = new Application(req.body);

    return (_.isEmpty(req.job) ? Job.findById(jobId) : Q.when(req.job))
        .then(function (job) {
            req.log.trace({func: 'create.findJob'}, 'Found Job: %j', job);
            req.job = job;

            req.log.trace({body: req.body}, 'create', 'Creating new application from body');
            req.log.info({func: 'create'}, 'Creating new application');

            // TODO: Confirm that new logic properly processes documents
            var processedDocs = processDocuments(req, application);

            return Q.all(processedDocs);
        })
        .then(function (results) {

            // TODO: Check if there is a difference
            application.releases = results;

            req.log.debug({
                releases: application.releases,
                func    : 'create.docsSaved'
            }, 'Saving application with releases');

            application.user    = req.user;
            application.job     = req.job;
            application.company = (!!req.job) ? req.job.company : null;

            req.log.info({func: 'create.docsSaved'}, 'Creating new application', {
                user: application.user.id,
                job : application.job.id
            });

            req.log.trace({func: 'create.docsSaved'}, 'Creating new application', {application: application});

            return application.save();
        })
        .then(function (application) {
            req.application = application;

            req.log.info({func: 'create.postSave'},
                'New Application save successfully! Now saving to the job',
                {application: application.id, user: application.user.id, job: application.job.id});
            req.log.trace({func: 'create.postSave'}, 'New Application save successfully!', {application: application});

            req.job.applications.push(application);
            return req.job.save();
        },
        function (err) {
            req.log.error({func: 'create.applicationSave', error: err}, 'error saving job application');
            throw err;
        })
        .then(function (job) {
            req.log.info({
                func        : 'create.postJobSave',
                applications: job.applications
            }, 'saved job application to job');
            return job;
        },
        function (err) {
            req.log.error({func: 'create.postJobSave', error: err}, 'error saving job application to job');
            throw err;
        })
        .then(function () {

            if (!req.application.isDraft) {
                req.log.debug({func: 'create.postJobSave'}, 'Sending email for New Application');
                sendNewApplicantEmail(req.user, req.job, req.application);
            }

            req.log.debug({func: 'create.postJobSave'}, 'Successfully saved new application');

            return res.status(201).json(req.application.toObject());
        })
        .then(null, function (err) {
            req.log.error({func: 'create.postSave'}, 'Error saving application: %j', err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
}

function sendNewApplicantEmail(user, job, application) {
    var options = [
        {
            name   : 'APPLICANT',
            content: user.firstName + ' ' + user.lastName.substring(0, 1).toUpperCase()
        },
        {
            name   : 'COVER_LTR',
            content: application.introduction
        },
        {
            name   : 'LINK_URL',
            content: 'https://joinoutset.com/applications?itemId=' + application.id + '&tabName=applicants'
        }
    ];

    emailer.sendTemplateBySlug('outset-new-applicant', job.user, options);
}

/**
 * Show the current Application
 */
function read(req, res) {

    req.application = req.application || req.applications && _.first(req.applications);

    if (!req.application) {
        return res.status(404).send({
            message: 'No application found'
        });
    }

    res.json(req.application);
}

/**
 * Update a Application
 */
function update(req, res) {
    req.log.trace('update', 'Updating existing application from body', {
        application: req.application,
        body       : req.body
    });
    req.log.info('update', 'Updating existing application', {url: req.url});

    var application = req.application;

    var wasDraft = application.isDraft;

    var data = _.merge(application.toJSON(), req.body);
    _.extend(application, data);

    if (!_.isEmpty(data.releases) && _.isString(application.releases)) {
        application.releases = data.releases;
    }

    var processedDocs = processDocuments(req, application);

    // Handle nested

    Q.all(processedDocs).then(
        function (releases) {
            // var fulfilledReleases = _.pluck(_.where(releases, {state: 'fulfilled'}), 'value');

            // TODO: Determine if this is necessary, or if it was handled in the map funciton above
            _.each(releases, function (release) {
                var existing = _.findIndex(application.releases, {releaseType: release.releaseType});

                if (existing !== -1) {
                    application.releases[existing] = release;
                } else {
                    application.releases.push(release);
                }
            });

            return application;
        }).then(function (application) {

            if (application.isModified()) {
                return application.save();
            }

            req.log.debug('update', 'Application has not been modified.... resolving');
            return Q.when(application);
        }).then(function (success) {
            var options = [
                {path: 'job', model: 'Job'},
                {path: 'company', model: 'Company', select: 'name owner agents profileImageURL'},
                {path: 'connection'},
                {path: 'messages.sender', model: 'User'},
                {path: 'user.driver', model: 'Driver'},
                {path: 'connection.isValid'}
            ];

            Application.populate(application, options, function (err, populated) {
                if (err) {
                    req.log.warn('update', 'error retrieving application, returning non-populated version', err);
                    return res.json(application);
                }

                if (wasDraft && !application.isDraft) {
                    req.log.debug('update', 'Sending email for Newly Published Application');
                    sendNewApplicantEmail(application.user, application.job, application);
                }

                res.json(populated);
            });
        }).catch(function (err) {
            req.log.error('update', 'Error updating application', {application: application, error: err});
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
}

function patchUpdate(req, res) {
    req.log.trace({func: 'patchUpdate'}, 'Patching existing application');

    var patch = req.body;

    if (!_.isEmpty(patch._id)) {
        return res.status(400).send('Invalid patch request - cannot change document ID');
    }

    var application = _.extend(req.application, patch);

    if (application.isModified()) {
        return application.save()
            .then(function (application) {
                return res.json(application);
            });
    }

    return res.json(application);
}

/**
 * Delete an Application
 */
function remove(req, res) {
    var application = req.application;

    application.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(application);
        }
    });
}

// deprecate ?
function queryByJobId(req, res) {
    var jobId = req.params.jobId;

    if (!req.user.isAdmin && !jobId) {
        req.log.debug('[ApplicationsCtrl.queryByJobId]', 'Cannot search without a jobId');
        return res.status(400).send({
            message: 'Must include jobID in request to find Applications by job'
        });
    }

    var query = {
        job: jobId
    };

    req.query = query;

    req.log.debug({query: req.query}, 'Executing Query with params');

    executeQuery(req, res);

}

// depreacate ?
function queryByCompanyId(req, res) {
    var companyId = req.company && req.company._id || req.params.companyId;
    req.log.debug('[ApplicationsController] queryByCompanyID(%s)', companyId);

    if (!companyId) {
        req.log.debug('[ApplicationsCtrl.queryByCompanyID]', 'Cannot search without a companyId');
        return res.status(400).send({
            message: 'Must include companyId in request to find Applications by company'
        });
    }

    req.query = {
        company: companyId
    };

    req.sort = '-modified';

    executeQuery(req, res);
}

function loadMine(req, res) {
    return queryByUserID(req, res, null, req.user._id);
}

function queryByUserID(req, res) {

    if (req.user.type === 'driver') {
        req.log.debug('[ApplicationsController] queryByUserID(%s)', req.params.userId);
        req.query = {
            user: req.params.userId
        };
    }
    else if (req.user.type === 'owner') {
        req.log.debug('[ApplicationsController] queryByUserID(company.owner:%s)', req.userId);
        req.query = {
            'company.owner': req.userId
        };
    }

    debugger;
    req.log.debug('[ApplicationsController] queryByUserID: Overriding query to use request params only');
    req.query = {
        user: req.params.userId
    };

    executeQuery(req, res);
}

function getByJobId(req, res, next) {

    req.log.debug('[ApplicationsController.byJob] Request: %j %s', req.route.methods, req.url);
    req.log.debug('[ApplicationsController.byJob] Loading applications for job %s for user %s', req.params.jobId, req.params.userId);

    var query = {
        job : req.params.jobId,
        user: req.params.userId
    };

    Application.findOne(query)
        .exec(function (err, application) {
            if (err) {
                return next(err);
            }

            req.log.debug('[ApplicationController.byJob] Got application!');

            req.application = application;
            next();
        });
}

/**
 * Application middleware
 */
function applicationByID(req, res, next, id) {

    req.log.debug('[ApplicationsController] applicationById(%s) URL: %s', id, req.url);

    Application.findById(id)
        .populate({path: 'user', model: 'User'})
        .populate('job')
        .populate('company', 'name owner agents profileImageURL')
        .populate('messages')
        .populate('connection')
        .exec(function (err, application) {
            if (err) {
                return next(err);
            }

            if (!application) {
                req.log.debug('[ApplicationById] No Application Found');
                return res.status(404).send({message: 'No application found for ID'});
            }

            req.application = application;

            var options = [
                {path: 'messages.sender', model: 'User', select: 'displayName profileImageURL'},
                {path: 'user.driver', model: 'Driver'},
                {path: 'connection.isValid'}
            ];

            Application.populate(application, options, function (err, populated) {
                if (err) {
                    req.log.error('error retrieving application, returning non-populated version', err);
                    next();
                }

                req.application = populated;
                next();
            });

        });
}


/**
 * Application authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    req.log.trace({func: 'hasAuthorization', user: req.user, application: req.application}, 'Authorizing access to this Application');

    if(req.user.isDriver && req.application.user._id.equals(req.user.id)) {
        req.log.debug({func: 'hasAuthorization'}, 'Authorized: Driver matches Application User');
        return next();
    }

    if(req.user.isOwner && req.application.company._id.equals(req.user.company)) {
        req.log.debug({func: 'hasAuthorization'}, 'Authorized: Owner Company matches Application Company');
        return next();
    }

    if(req.user.isAdmin) {
        req.log.debug({func: 'hasAuthorization'}, 'Authorized: User is an Admin');
        return next();
    }

    req.log.debug({func: 'hasAuthorization'}, 'Unauthorized: User does not have access to this application');

    return res.status(403).send('User is not authorized');
};

/** ---- MESSAGES ------------------------------------------ */

exports.getMessages = function (req, res, next) {
    var application = req.application;

    if (!application) {
        return res.status(404).send({message: 'No application found for ID'});
    }

    req.log.debug('starting cleansing user from messages');
    _.map(application.messages, function (message) {
        if (!!message.sender) {
            req.log.debug('cleansing user from message');
            message.sender.cleanse();
        }
    });

    req.log.debug('finished cleansing user from messages');

    var response = {data: application.messages, theirs: [], latest: {}};

    var myLast = _.findLast(application.messages, function (msg) {
        if (!msg || !msg.sender) {
            return false;
        }
        if (!req.user) {
            return false;
        }
        return req.user.equals(msg.sender);
    });

    var newCt = 0;

    response.theirs = _.filter(application.messages, function (msg) {
        if (!myLast || myLast.created < msg.created) {
            msg.isFresh = true;
            newCt++;
        }

        if (!msg.sender) {
            return false;
        }

        return !req.user.equals(msg.sender);
    });

    response.newMessages = newCt;

    response.latest = _.max(application.messages, function (msg) {
        return msg.created;
    });


    if (application && (!application.connection || !application.isConnected)) {
        response.message = 'No valid connection';
        return res.status(403).send(response);
    } else {
        res.json(response);
    }
};

exports.persistMessage = function (applicationId, message) {
    debugger;
    var msg = new Message({
        sender: message.sender,
        text  : message.text,
        status: message.status || 'sent'
    });

    log.debug('Saving new message object to DB: %j', msg);

    msg.save(function (err, newMessage) {
        if (err) {
            log.error('CRAP - Couldn\'t save message, %j', err);
            debugger;
        }
        else {
            log.debug('SAVED message object to DB: %j', newMessage);

            Application.findOneAndUpdate(
                {_id: applicationId},
                {$push: {messages: msg}},
                {safe: true, upsert: false})
                .populate('user')
                .populate('company')
                .populate('job')
                .exec(
                function (err, model) {
                    if (err) {
                        log.error('Couldn\'t save application with message, %j', err);
                    }

                    log.debug('saved application: ' + model);


                    debugger; // CHECK FOR JOB NAME

                    var options = [
                        {path: 'company.owner', model: 'User'}
                    ];

                    Application.populate(model, options, function (err, populated) {
                        if (err) {
                            log.error('error retrieving application, returning non-populated version', err);
                            return false;
                        }
                        debugger;
                        var recipient = msg.sender.equals(populated.user.id) ? populated.company.owner : populated.user;

                        var options = [
                            {
                                name   : 'JOB_TITLE',
                                content: populated.job.name
                            },
                            {
                                name   : 'LINK_URL',
                                content: 'https://joinoutset.com/applications/' + populated.id
                            }
                        ];

                        emailer.sendTemplateBySlug('outset-new-messages', recipient, options);
                    });

                }
            );


        }
    });


};

/** CONNECTIONS ------------------------------------------------------ */
exports.createConnection = function (req, res) {
    // do error checking;

    if (req.application) {
        var connection, cnxn = {
            company: req.application.company,
            user   : req.application.user,
            status : 'full'
        };

        if (req.application.connection) {
            req.log.debug('[CreateConnection] Updating existing connection');
            connection = _.extend(req.application.connection, cnxn);
        }
        else {
            req.log.debug('[CreateConnection] Creating new connection');
            connection = new Connection(cnxn);
        }


        req.log.debug('[CreateConnection] Saving connection: %j', connection);

        connection.save(function (err) {
            if (err) {
                req.log.error('Error saving connection', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (!req.application.connection) {
                    req.application.connection = connection;
                    req.application.status     = 'connected';

                    req.application.save(function (err, newApp) {
                        if (err) {
                            req.log.error('[CreateConnection] error saving connection to application', err);
                        }
                        req.log.debug('[CreateConnection] Did %sSave Connection to application', !!newApp.connection ? '' : 'NOT ');
                    });

                    debugger; // CHECK FOR JOB NAME

                    var options = [
                        {
                            name   : 'COMPANY_NAME',
                            content: req.application.company.name
                        },
                        {
                            name   : 'JOB_TITLE',
                            content: req.application.job.name
                        },
                        {
                            name   : 'LINK_URL',
                            content: 'https://joinoutset.com/applications/' + req.application.id
                        }
                    ];

                    emailer.sendTemplateBySlug('outset-new-connection-copy-01', req.application.user, options);
                }

                res.json(connection);
            }
        });
    }
    else {
        res.status(404).send({message: 'no application found'});
    }
};

/** Questionairre Intake Forms **/

var questionList = {
    'default': [
        {
            'description': 'Cover Letter',
            'name'       : '',
            'length'     : '',
            'type'       : 'text',
            'required'   : true
        }
    ]
};

exports.getQuestions = function (req, res) {

    var response = {
        'default': questionList['default']
    };

    if (req.job && req.job.company.id) {
        var questions = questionList[req.job.company.id];
        if (!!questions) {
            return (response.company = questions);
        }
    }

    res.json(response);
};
