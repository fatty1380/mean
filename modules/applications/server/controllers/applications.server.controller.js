'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
    file: 'Applications.Controller'
}),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
emailer      = require(path.resolve('./modules/emailer/server/controllers/emailer.server.controller')),
releaseDocs  = require(path.resolve('./modules/applications/server/controllers/release-documents.server.controller')),
moment       = require('moment'),
_            = require('lodash');

/**
 * "Instance" Methods
 */

var executeQuery = function (req, res) {

    var query = req.query || {};
    var sort = req.sort || '-created';

    Application.find(query)
        .sort(sort)
        .populate('user', 'displayName profileImageURL')
        .populate('job') // TODO: Optimize Later
        .populate('company', 'name profileImageURL')
        .populate('connection')
        .populate('messages') // TODO: Optimize Later
        .exec(function (err, applications) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            req.applications = applications || [];
            console.log('[ApplicationsCtrl.executeQuery] Found %d applications for query %j (%s)', req.applications.length, query, req.url);

            //console.log('[ApplicationCtrl.returnValue(s): %s', JSON.stringify(req.applications, undefined, 2));
            res.json(req.applications);
        });
};

/**
 * Create a Application
 */
exports.create = function (req, res) {

    log.trace('create', 'Creating new application from body', {body: req.body, url: req.url});
    log.info('create', 'Creating new application', {url: req.url});

    var releases = req.body.releases;
    delete req.body.releases;

    var application = new Application(req.body);

    var processedDocs = _.map(releases, function (release) {
        var newRelease = new Release(release);

        return releaseDocs.generateDocument(newRelease, req.user)
            .then(function (release) {
                debugger;
                _.extend(newRelease, release);
            });
    });


    Q.allSettled(processedDocs).then(
        function (results) {
            application.releases = results;

            log.debug('create.docsSaved', 'Saving application with releases', {releases: application.releases});


            log.debug('create.docsSaved', 'Comparing request objects with Id Objects', {
                reqJobId: req.job && req.job._id,
                jobId: req.body.jobId,
                reqUserId: req.user && req.user._id,
                userId: req.body.userId
            });

            application.user = req.user;
            application.job = req.job;
            application.company = (!!req.job) ? req.job.company : null;

            log.info('create.docsSaved', 'Creating new application', {user: application.user.id, job: application.job.id});
            log.trace('create.docsSaved', 'Creating new application', {application: application});

            application.save(function (err) {
                if (err) {
                    console.error('create.postSave', 'Error saving application: %j', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    log.info('create.postSave', 'New Application save successfully!', {user: application.user.id, job: application.job.id});
                    log.trace('create.postSave', 'New Application save successfully!', {application: application});

                    log.trace('create.postSave', 'Saving application to the existing Job', {application: application.id, job: application.job.id});

                    req.job.applications.push(application);
                    req.job.save(function (err) {
                        if (err) {
                            log.error('create.postJobSave', 'error saving job application to job', {error: err});
                        }
                        else {
                            log.info('create.postJobSave', 'saved job application to job');
                        }

                        if (!application.isDraft) {
                            log.debug('create.postJobSave', 'Sending email for New Application');
                            sendNewApplicantEmail(req.user, req.job, application);
                        }
                    });

                    res.json(application);
                }
            });

        }
    );
};

function sendNewApplicantEmail(user, job, application) {
    var options = [
        {
            name: 'APPLICANT',
            content: user.firstName + ' ' + user.lastName.substring(0, 1).toUpperCase()
        },
        {
            name: 'COVER_LTR',
            content: application.introduction
        },
        {
            name: 'LINK_URL',
            content: 'https://joinoutset.com/applications?itemId=' + application.id + '&tabName=applicants'
        }
    ];

    emailer.sendTemplateBySlug('outset-new-applicant', job.user, options);
}

/**
 * Show the current Application
 */
exports.read = function (req, res) {
    if (!req.application) {
        return res.status(404).send({
            message: 'No application found'
        });
    }

    res.json(req.application);
};

/**
 * Update a Application
 */
exports.update = function (req, res) {
    log.trace('update', 'Updating existing application from body', {existing: req.application, body: req.body, url: req.url});
    log.info('update', 'Updating existing application', {url: req.url});

    var application = req.application;

    var wasDraft = application.isDraft;

    var data = _.merge(application.toJSON(), req.body);
    _.extend(application, data);

    if (!_.isEmpty(data.releases) && _.isString(application.releases)) {
        application.releases = data.releases;
    }

    var processedDocs = _.map(application.releases, function (release) {
        if (_.isEmpty(release.file) || moment(release.signature.timestamp).isAfter(release.modified)) {
            log.info('update', 'Saving file to cloud');
            var newRelease = new Release(release);
            return releaseDocs.generateDocument(newRelease, req.user);
        }

        log.info('update', 'File has already been saved to cloud');
        return Q.when(release);
    });

    // Handle nested

    Q.allSettled(processedDocs).then(
        function (releases) {
            var fulfilledReleases = _.pluck(_.where(releases, {state: 'fulfilled'}), 'value');

            _.each(fulfilledReleases, function (release) {
                var existing = _.findIndex(application.releases, {releaseType: release.releaseType});

                if (existing !== -1) {
                    application.releases[0] = release;
                } else {
                    application.releases.push(release);
                }
            });

            return application;
        }).then(function (application) {

            if (application.isModified()) {
                return application.save();
            }

            log.debug('update', 'Application has not been modified.... resolving');
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
                    log.warn('update', 'error retrieving application, returning non-populated version', err);
                    return res.json(application);
                }

                if (wasDraft && !application.isDraft) {
                    log.debug('update', 'Sending email for Newly Published Application');
                    sendNewApplicantEmail(application.user, application.job, application);
                }

                res.json(populated);
            });
        }).catch(function (err) {
            log.error('update', 'Error updating application', {application: application, error: err});
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        });
};


/**
 * Delete an Application
 */
exports.delete = function (req, res) {
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
};

/**
 * List of *ALL* Applications
 */
exports.listAll = function (req, res) {
    debugger; // TODO : route to correct list
    req.sort = '-created';

    executeQuery(req, res);
};

exports.queryByJobID = function (req, res) {
    var jobId = req.params.jobId;

    if (!jobId) {
        console.log('[ApplicationsCtrl.queryByJobId]', 'Cannot search without a jobId');
        return res.status(400).send({
            message: 'Must include jobID in request to find Applications by job'
        });
    }

    var query = {
        job: jobId
    };

    var user = req.user;
    var isAdmin = !!user && ((typeof user.isAdmin !== 'undefined') ? user.isAdmin : user.roles.indexOf('admin') !== -1);

    if (!isAdmin && !!user && user.type.toLowerCase() === 'driver') {
        query.user = user.id;
    }

    req.query = query;

    executeQuery(req, res);

};

exports.queryByCompanyID = function (req, res) {
    var companyId = req.company && req.company._id || req.params.companyId;
    console.log('[ApplicationsController] queryByCompanyID(%s)', companyId);

    if (!companyId) {
        console.log('[ApplicationsCtrl.queryByCompanyID]', 'Cannot search without a companyId');
        return res.status(400).send({
            message: 'Must include companyId in request to find Applications by company'
        });
    }

    req.query = {
        company: companyId
    };

    req.sort = '-modified';

    executeQuery(req, res);
};

exports.loadMine = function (req, res) {
    return this.queryByUserID(req, res, null, req.user._id);
};

exports.queryByUserID = function (req, res) {

    if (req.user.type === 'driver') {
        console.log('[ApplicationsController] queryByUserID(%s)', req.params.userId);
        req.query = {
            user: req.params.userId
        };
    }
    else if (req.user.type === 'owner') {
        console.log('[ApplicationsController] queryByUserID(company.owner:%s)', req.userId);
        req.query = {
            'company.owner': req.userId
        };
    }

    debugger;
    console.log('[ApplicationsController] queryByUserID: Overriding query to use request params only');
    req.query = {
        user: req.params.userId
    };

    executeQuery(req, res);
};

exports.getByJobId = function (req, res, next) {

    console.log('[ApplicationsController.byJob] Request: %j %s', req.route.methods, req.url);
    console.log('[ApplicationsController.byJob] Loading applications for job %s for user %s', req.params.jobId, req.params.userId);

    var query = {
        job: req.params.jobId,
        user: req.params.userId
    };

    Application.findOne(query)
        .exec(function (err, application) {
            if (err) {
                return next(err);
            }

            console.log('[ApplicationController.byJob] Got application!');

            req.application = application;
            next();
        });
};

/**
 * Application middleware
 */
exports.applicationByID = function (req, res, next, id) {

    console.log('[ApplicationsController] applicationById(%s) URL: %s', id, req.url);

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
                console.log('[ApplicationById] No Application Found');
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
                    console.log('error retrieving application, returning non-populated version', err);
                    next();
                }

                req.application = populated;
                next();
            });

        });
};


/**
 * Application authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.application.user.id !== req.user.id && !req.application.job.user.equals(req.user.id)) {
        return res.status(403).send('User is not authorized');
    }
    next();
};

/** ---- MESSAGES ------------------------------------------ */

exports.getMessages = function (req, res, next) {
    var application = req.application;

    if (!application) {
        return res.status(404).send({message: 'No application found for ID'});
    }

    console.log('starting cleansing user from messages');
    _.map(application.messages, function (message) {
        if (!!message.sender) {
            console.log('cleansing user from message');
            message.sender.cleanse();
        }
    });

    console.log('finished cleansing user from messages');

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
        text: message.text,
        status: message.status || 'sent'
    });

    console.log('Saving new message object to DB: %j', msg);

    msg.save(function (err, newMessage) {
        if (err) {
            console.log('CRAP - Couldn\'t save message, %j', err);
            debugger;
        }
        else {
            console.log('SAVED message object to DB: %j', newMessage);

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
                        console.log('Couldn\'t save application with message, %j', err);
                    }

                    console.log('saved application: ' + model);


                    debugger; // CHECK FOR JOB NAME

                    var options = [
                        {path: 'company.owner', model: 'User'}
                    ];

                    Application.populate(model, options, function (err, populated) {
                        if (err) {
                            console.log('error retrieving application, returning non-populated version', err);
                            return false;
                        }
                        debugger;
                        var recipient = msg.sender.equals(populated.user.id) ? populated.company.owner : populated.user;

                        var options = [
                            {
                                name: 'JOB_TITLE',
                                content: populated.job.name
                            },
                            {
                                name: 'LINK_URL',
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
            user: req.application.user,
            status: 'full'
        };

        if (req.application.connection) {
            console.log('[CreateConnection] Updating existing connection');
            connection = _.extend(req.application.connection, cnxn);
        }
        else {
            console.log('[CreateConnection] Creating new connection');
            connection = new Connection(cnxn);
        }


        console.log('[CreateConnection] Saving connection: %j', connection);

        connection.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (!req.application.connection) {
                    req.application.connection = connection;
                    req.application.status = 'connected';

                    req.application.save(function (err, newApp) {
                        if (err) {
                            console.error('[CreateConnection] error saving connection to application', err);
                        }
                        console.log('[CreateConnection] Did %sSave Connection to application', !!newApp.connection ? '' : 'NOT ');
                    });

                    debugger; // CHECK FOR JOB NAME

                    var options = [
                        {
                            name: 'COMPANY_NAME',
                            content: req.application.company.name
                        },
                        {
                            name: 'JOB_TITLE',
                            content: req.application.job.name
                        },
                        {
                            name: 'LINK_URL',
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
            'name': '',
            'length': '',
            'type': 'text',
            'required': true
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
