'use strict';

/**
 * Module Dependenceies
 */

var mongoose = require('mongoose'),
PDF = require('pdfkit'),
streams = require('memory-streams'),
path         = require('path'),
Application  = mongoose.model('Application'),
Release      = mongoose.model('Release'),
_            = require('lodash');

exports.generateDocuments = function(application, user) {
    var releases = application.releases;

    if(!_.isArray(releases)) {
        console.log('Releases is not an array :(');
        return false;
    }

    var docs = _.each(releases, function(release) {
        var doc = new PDF();
        var writable = new streams.WritableStream();

        doc.pipe(writable);

        doc.fontSize(8);
        doc.text(release.releaseText, {width: 410, align: 'left'});

        doc.image(release.signature.dataUrl, {width: 400});

        doc.end();

        return {key: release.releaseType, stream: writable};
    });
};

exports.runTest = function(req, res, next) {

    var id = req.application && req.application._id || req.applicationId;

    Application.findById(req.applicationId)
        .exec(function(err, application) {


    });
};
