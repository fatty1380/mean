'use strict';

/**
 * Module Dependenceies
 */

var mongoose     = require('mongoose'),
    path         = require('path'),
    pdf          = require('html-pdf'),
    fs           = require('fs'),
    swig         = require('swig'),
    Q            = require('q'),
    log          = require(path.resolve('./config/lib/logger')).child({
        module: 'applications',
        file  : 'Release-Documents.Controller'
    }),
    Application  = mongoose.model('Application'),
    Release      = mongoose.model('Release'),
    Driver       = mongoose.model('Driver'),
    _            = require('lodash'),
    fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
    moment       = require('moment');

var applicationExample, releaseExample, config;

swig.setDefaults({autoescape: false, cache: false});

exports.generateDocuments = function (application, user) {
    var releases = application.releases;

    if (!_.isArray(releases)) {
        log.debug('Releases is not an array :(');
        return false;
    }

    var docs = _.each(releases, function (release) {
        var doc = exports.generateDocument(release, user);
        debugger;
        return doc;
    });

    debugger;

    return Q.allSettled(docs).then(function (results) {
        debugger;

        return results;
    });
};

exports.generateDocument = function (release, user) {
    log.debug({func: 'generateDocument'}, 'START');

    var savedDoc = exports.saveFileToCloud(release, user)
        .then(function (cloudDoc) {
            log.debug({func: 'generateDocument'}, 'successfully uploaded document to %j', cloudDoc);

            debugger;

            if (_.isEmpty(release.file)) {
                release.file = {owner: user, sku: release.releaseType, isSecure: true};
            }

            _.extend(release.file, cloudDoc, {expires: moment().add(15, 'm').toDate()});

            log.debug({func: 'generateDocument'}, 'Saving Driver');
            return release.save();
        })
        .then(function (releaseResponse) {
            log.debug({func: 'generateDocument'}, 'successfully saved Release! %s', JSON.stringify(releaseResponse, null, 2));

            return releaseResponse;

        })
        .catch(function (error) {
            log.error({func: 'generateDocument'}, 'Failed to complete Release Save: %s', JSON.stringify(error, null, 2));

            return Q.reject(error);
        });

    return savedDoc;
};

exports.saveFileToCloud = function (release, user) {
    log.debug({func: 'saveFileToCloud'}, 'START');

    return Driver.findOne({user: user.id}).then(
        function (driver) {

            log.debug({func: 'saveFileToCloud', driver: driver}, 'Loaded driver from user');

            user.driver = driver;
            var sku     = release.releaseType;

            log.debug({func: 'saveFileToCloud', releaseType: sku}, 'Generating new Release');

            return createPDF(release).then(
                function (buffer) {

                    var files = {
                        file: {
                            buffer   : buffer,
                            name     : sku + '.' + user.shortName + '.pdf',
                            extension: 'pdf'
                        }
                    };

                    log.debug({func: 'saveFileToCloud'}, 'saving file to cloud!');

                    return fileUploader.saveFileToCloud(files, 'secure-content', true);
                });


        });
};

function createPDF(release) {
    log.debug({func: 'createPDF'}, 'Start');
    var document = getHTML(release);

    log.trace({func: 'createPDF', document: document}, 'Loaded HTML for doucment');
    var deferred = Q.defer();

    log.debug({func: 'createPDF', config: config}, 'Creating PDF');

    var file = pdf.create(document, config);

    log.debug({func: 'createPDF'}, 'Got file back, now saving to buffer');

    file.toBuffer(function (err, buffer) {
        if (err) {
            log.error({func: 'createPDF', error: err}, 'creating pdf failed');
            return deferred.reject(err);
        }

        log.error({func: 'createPDF'}, 'Resolving with buffer');
        deferred.resolve(buffer);
    });

    return deferred.promise;
}

function getHTML(release) {

    var doc = swig.renderFile('./modules/applications/server/views/pdfcore.server.view.html', {
        body        : release.releaseText,
        signatureURL: release.signature.dataUrl,
        sigDate     : release.signature.timestamp,
        name        : release.name,
        dob         : release.dob
    });

    return doc;
}

config = {
    'format'     : 'Letter',        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
    'orientation': 'portrait', // portrait or landscape

    // Page options
    'border': {
        'top'   : '0.5in',            // default is 0, units: mm, cm, in, px
        'right' : '1in',
        'bottom': '0.5in',
        'left'  : '1in'
    },

    'header': {
        'height'  : '.5in',
        'contents': '<div style=\'text-align: center;\'>This is a header thing!</div>'
    },
    'footer': {
        'height'  : '.5in',
        'contents': '<span style=\'color: #444;\'>{{page}}</span>/<span>{{pages}}</span>'
    },

    // File options
    'type'   : 'pdf',             // allowed file types: png, jpeg, pdf
    'quality': '75',           // only used for types png & jpeg

    // Script options
    'phantomPath': './node_modules/phantomjs/bin/phantomjs', // PhantomJS binary which should get downloaded automatically
    //'script': '/url',           // Absolute path to a custom phantomjs script, use the file in lib/scripts as example
    'timeout'    : 30000           // Timeout that will cancel phantomjs, in milliseconds

};
