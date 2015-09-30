'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	LBDocument = mongoose.model('Document'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    moment = require('moment'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'documents',
        file: 'controller'
    });
    
/***************************************************
 * Exported Methods
 */
exports.create = create; 
exports.read = read; 
exports.update = update; 
exports.delete = deleteReport; 
exports.list = list; 
exports.documentByID = documentByID; 
exports.uploadResume = uploadResume; 
exports.refreshResume = refreshResume; 
exports.refreshReport = refresh; 


function createWithBody(req, res) {
    req.log.debug({ func: 'createWithBody' }, 'Start');
    
    var user = req.user;
    

    if (!user) {
        return res.status(401).send({
            message: 'User is not signed in'
        });
    }
    
    var file = req.body;
    file.sku = file.sku || 'misc';
    file.user = req.user._id;
    
    debugger;
    
    if (!file.url) {
        return res.status(400).send({
            message: 'No URL/data Uploaded'
        });
    }
    
    req.log.info({ func: 'createWithBody', file: file }, 'Creating file based on req body');
    req.log.info({ func: 'createWithBody', sku: file.sku }, 'Breakdown');
    req.log.info({ func: 'createWithBody', url: file.url }, 'Breakdown');
    req.log.info({ func: 'createWithBody', keys: _.keys(file) }, 'Breakdown');
    
    req.document = new LBDocument(file);
    
    saveDocumentToDB(req, res);
}
    
/**
 * Create a Document
 */
function create(req, res) {
    
    if (_.isEmpty(req.files.file)) {
        return createWithBody(req, res);
    }
    
    req.log.debug('[DriverCtrl.create] Start');
    
    var user = req.user;
    if (!user) {
        return res.status(401).send({
            message: 'User is not signed in'
        });
    }
    
    var sku = req.files.file.sku || 'resume';

    req.files.file.name = sku + '.' + req.user.shortName + '.' + req.files.file.extension;

    return fileUploader
        .saveFileToCloud(req.files, 'secure-content', true)
        .then(
            function (response) {
                req.log.debug('successfully uploaded user resume to %j', response);
                
                req.document = new LBDocument(response);
                
                req.document.expires = moment().add(15, 'm').toDate();
    
                return saveDocumentToDB(req, res);
    
            },
            function (error) {
                req.log.debug('Failed to save Resume: %j', error);
                return res.status(400).send({
                    message: 'Unable to save Driver Resume. Please try again later'
                });
             });
}


/**
 * Show the current Document
 */
function read(req, res) {
	res.jsonp(req.document);
}

/**
 * Update a Document
 */
function update(req, res) {
	var document = req.document ;

	document = _.extend(document , req.body);

	document.save(function(err) {
		if (err) {
			return res.status(400).send({
                message: errorHandler.getErrorMessage(err),
                body: req.body
			});
		} else {
			res.jsonp(document);
		}
	});
}

/**
 * Delete an Document
 */
function deleteReport(req, res) {
    var document = req.document;
    
    req.log.warn({ func: 'deleteDocument', file: 'documents.server.controller' }, 'Doc Record removed, but S3 storage not affected');

	document.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(document);
		}
	});
}

/**
 * List of Documents
 */
function list(req, res) { LBDocument.find().sort('-created').populate('user', 'displayName').exec(function(err, documents) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(documents);
		}
	});
}

/**
 * Document middleware
 */
function documentByID(req, res, next, id) { LBDocument.findById(id).populate('user', 'displayName').exec(function(err, document) {
    if (err) { return next(err);}
		if (! document) {return next(new Error('Failed to load Document ' + id));}
		req.document = document ;
		next();
	});
}





/**
 * Update profile picture
 * -----------------------
 * Driver Migration: True
 * This has been updated to handle the new combined user/driver object.
 */
function uploadResume(req, res) {
    req.log.warn({ func: 'uploadResume' }, 'This function is Deprecated');
    return create(req.res);
}

function refreshResume(req, res) {
    req.log.debug('[DriverCtrl.refreshResume] Start');

    req.params.reportSku = 'resume';

    return refresh(req, res);
}

/**
 * Refresh Report
 * -----------------------
 * Driver Migration: True
 * This has been updated to handle the new combined user/driver object.
 * -----------------------
 * This method returns the URL of a specific reportSKU. If the URL is public, or
 * if it is private and has not expired, it will return that URL. Otherwise, it
 * will make a request to get a new secure signed URL.
 */
function refresh(req, res) {

    req.log.debug({func: 'refresh'}, 'Start');
    var user = req.user;
	
    if (!user) {
		// TODO : Handle in `Policies` specification
        req.log.debug({func: 'refresh'}, 'User is not signed in');
        return res.status(401).send({
            message: 'User is not signed in'
        });
    }
	
	var document = req.document;

    if (!(document && document.bucket && document.key)) {
        return res.status(404).send({
            message: 'Driver does not have a report on file'
        });
    }

    if (moment().isBefore(document.expires)) {
        req.log.debug({func: 'refresh'}, 'document has not yet expired =====');
        return res.json(document);
    }

    fileUploader.getSecureReadURL(document.bucket, document.key).then(
        function (updatedURL) {
            document.updateReportURL(updatedURL);

            req.log.debug({func: 'refresh'}, 'Post secure upload, resolving with : %j', updatedURL);

            res.json(document);

            document.save(function (err, updated) {
                if (err) {
                    req.log.error({func: 'refresh', error: err}, 'unable to save updated report url');
                } else {
                    req.log.debug({func: 'refresh'}, 'Saved updated report URL');
                }
            });
        }, function (err) {
            req.log.error({func: 'refresh', error: err}, 'Post secure upload failed');

            return res.status(400).send({
                message: 'Unable to retrieve fresh URL for resume'
            });
        });
}

/////////////////////////////////////////////////////////////

function saveDocumentToDB(req, res) {
    
    if (!req.document) {
        console.error({ func: 'saveDocumentToDB' }, 'No Document defined on request');
        
        return res.status(400).send({
            message: 'No Document Defined in Request'
        });
    }
    
    return req.document
        .save()
        .then(
        function (success) {
            req.log.debug({ func: 'saveDocumentToDB', sku: success.sku, id: success.id }, 'Successfully saved document to DB')
            req.document = success;
            res.json(req.document);
        },
        function (saveError) {
            req.log.error({ func: 'create', error: saveError, errorMsg: errorHandler.getErrorMessage(saveError) }, 'unable to save document');
            return res.status(400).send({
                message: errorHandler.getErrorMessage(saveError)
            });
        });
}