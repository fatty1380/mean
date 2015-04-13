'use strict';

/**
 * Module Dependenceies
 */

var mongoose = require('mongoose'),
path         = require('path'),
pdf          = require('html-pdf'),
fs           = require('fs'),
swig         = require('swig'),
Q            = require('Q'),
Application  = mongoose.model('Application'),
Release      = mongoose.model('Release'),
_            = require('lodash'),
fileUploader = require(path.resolve('./modules/core/server/controllers/s3FileUpload.server.controller')),
moment       = require('moment');

var applicationExample, releaseExample, config;

swig.setDefaults({autoescape: false, cache: false});

exports.generateDocuments = function (application, user) {
    var releases = application.releases;

    if (!_.isArray(releases)) {
        console.log('Releases is not an array :(');
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
    return exports.saveFileToCloud(release, user, user.driver)
        .then(function (cloudDoc) {
            console.log('[ReleaseDocsCtrl] successfully uploaded document to %j', cloudDoc);

            debugger;

            if (_.isEmpty(release.file)) {
                release.file = {owner: user, sku: release.releaseType, isSecure: true};
            }

            _.extend(release.file, cloudDoc, {expires: moment().add(15, 'm').toDate()});

            console.log('[ReleaseDocsCtrl] Saving Driver');
            return release.save();
        }).then(function (releaseResponse) {
            console.log('[ReleaseDocsCtrl] successfully saved Release! %s', JSON.stringify(releaseResponse, null, 2));

            return releaseResponse;

        }).catch(function (error) {
            console.log('[ReleaseDocsCtrl] Failed to complete Release Save: %s', JSON.stringify(error, null, 2));

            return Q.reject(error);
        });
};

exports.runHTMLTest = function (req, res, next) {
    var document = getHTML(releaseExample);

    res.send(document);
};

exports.saveFileToCloud = function (release, user, driver) {

    var deferred = Q.defer();

    if(!!driver && !_.isString(driver)) {
        deferred.resolve(driver);
    } else {
        user.populate('driver').exec().then(function (newUser) {
            debugger;
            user.driver = newUser.driver;
            deferred.resolve(newUser.driver);
        });
    }

    deferred.promise.then(
        function (driver) {
            var sku = release.releaseType;

            return createPDF(release).then(
                function (buffer) {

                    var files = {
                        file: {
                            buffer: buffer,
                            name: sku + '.' + user.shortName + '.pdf',
                            extension: 'pdf'
                        }
                    };

                    console.log('[ReleaseDocsCtrl] saving file to cloud!');

                    return fileUploader.saveFileToCloud(files, 'secure-content', true);
                });


        });
};


exports.runTest = function (req, res, next) {

    var user = req.user;
    var driver = req.driver || user.populate('driver').exec().then(function (bigD) {
            driver = bigD;
            return driver;
        });

    var application = req.application || applicationExample;
    var release = application.release || releaseExample;

    var sku = release.releaseType;

    createPDF(release).then(
        function (buffer) {

            var files = {
                file: {
                    buffer: buffer,
                    name: sku + '.' + user.shortName + '.pdf',
                    extension: 'pdf'
                }
            };

            console.log('[ReleaseDocsCtrl] saving file to cloud!');

            return fileUploader.saveFileToCloud(files, 'secure-content', true);
        }).then(function (response) {
            console.log('[ReleaseDocsCtrl] successfully uploaded document to %j', response);

            debugger;

            if (_.isEmpty(driver.reports[sku])) {
                driver.reportsData.push({sku: sku});
            }

            _.extend(driver.reports[sku], response, {expires: moment().add(15, 'm').toDate()});

            console.log('[ReleaseDocsCtrl] Saving Driver');
            return driver.save();
        }).then(function (driver) {
            console.log('[ReleaseDocsCtrl] successfully saved Driver!');

            return res.json(driver.reports[sku]);

        }).catch(function (error) {
            console.log('[ReleaseDocsCtrl] Failed to complete Release Save: %s', JSON.stringify(error, null, 2));

            return res.status(400).send({
                message: 'CRAP! ' + error.message
            });
        });
};

function createPDF(release) {
    var document = getHTML(release);

    var deferred = Q.defer();

    pdf.create(document, config).toBuffer(function (err, buffer) {
        if (err) {
            console.log('ERROR: ', err);
            return deferred.reject(err);
        }

        deferred.resolve(buffer);
    });

    return deferred.promise;
}

function getHTML(release) {

    var doc = swig.renderFile('./modules/applications/server/views/pdfcore.server.view.html', {
        body: release.releaseText,
        signatureURL: release.signature.dataUrl,
        sigDate: release.signature.timestamp,
        name: release.name,
        dob: release.dob
    });

    return doc;
}

var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.ObjectId;


releaseExample = {
    'signature': {
        'timestamp': '2015-04-08T21:52:40.102Z',
        'dataUrl': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZ4AAADQCAYAAAA3WQenAAAAAXNSR0IArs4c6QAAMXNJREFUeAHtnQe0JUW1hlHJOadBZoYgIDmDCg7DoCICgiAiQXJQspJEkk9Fn4IiPhUBBwSUICq45IFkFZCMgkoQGREEBMkg+b3/Z3rP7Fu3+pxO55zuPv9ea9+qrrBr19fVqbr63BlmkIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIiACIhAzQi8o2b+yB0RMAKfRuSD0Iegz1iiQhEQgeYT0IWn+fuwjT1YAZ26FPoSdEno1VCJCIiACIiACPSMwJ9h+f+cLtezlmRYBERABERg6AlsDgL+osP4o0NPRQBEQAREQAR6RuBCWA4vPNyWiIAItITA21rSD3WjHQT4zvH1lK5orKaAUbIINI3A25vmsPxtNYGJre6dOicCIiACIlA7AhfDo9g0m6baarer5JAIFCeg6Yvi7FSzegKdLjAaq9XzlkURGAgBTbUNBLsajRCYOUi7223f6uKKioAINJzAjA33X+4PnsBMcGEZ6JPQJ0q4s0VQd263vbCLK1o9gaVgclMoP9zlAo+XoXzCnAs6L3RraCjPIuE26EPQbaFzQNPkemSsCp0TyvjJ0Muhz0FNmDcblL9S8QaU7TOUiIAINJQAbzDWhx4J/R/oqVBeJML3KddG0ljm5kj6A5E0noT4MzdF5BZU8v487LYZl1RPYDOY9MwHEeevU3Rqlx8Tr1h912VRBESgLAE+dSwL3QC6FXRv6DHQ+6GdDupe5X0G7eYV78vxqHwd1NIYl1RHgNOa34Ma3yaEF8HfD0DHQyUNJ/C2hvs/rO5z+uND0AOh69UUwsrwy7+n6eQmx+GbrgDvcA+B7p6knYFwjySuoByBeVA964+u8t3ab6F8Yp4D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'
    },
    'name': {
        'last': 'Fowler',
        'middle': 'D',
        'first': 'Patrick'
    },
    'created': '2015-04-08T19:21:03.500Z',
    'modified': '2015-04-08T19:21:03.500Z',
    '_id': '55257f9f1ba86194e1afc270',
    'dob': '1980-10-13',
    'releaseText': '<p class=\'strong text-center\'><u>DISCLOSURE AND AUTHORIZATION TO OBTAIN CONSUMER AND/OR INVESTIGATIVE CONSUMER REPORT</u></p><p>I, the undersigned, hereby consent and authorize <em class=\'strong\'>{{vm.companyName}}</em>, its affiliated companies, and/or its agents (collectively, herein after referred to as “ Company”) to obtain information about me from a consumer reporting agency for purposes permitted under the Fair Credit Reporting Act 15 U.S.C.1681 including employment purposes, a business transaction initiated by me, or upon my written instructions . I understand that this means that a “consumer report” and/or an “investigative consumer report” may be requested which may include information regarding my character, general reputation, personal characteristics and mode of living, whichever are applicable. The report may also contain information relating to my criminal history, credit history, motor vehicle records such as driving records, social security verification, verification of education or employment history or other background checks. This may involve personal interviews with sources such as neighbors, friends or associates. These reports may be obtained at any time after receipt of my authorization, and if I am hired or engaged to transact business with the Company, throughout my employment or relationship with the Company. I understand I have the right, upon written request made within a reasonable time after receipt of this notice, to request disclosure of the nature and scope of any investigative consumer report to e-Verifile, 900 Circle 75 Parkway, Suite 1550, Atlanta, GA 30339 – 770-859-9899. For information about e-Verifile’s privacy practices see www.e-verifile.com. The scope of this notice and authorization is not limited to the present and, if hired or engaged to transact business with the Company, will continue and allow the Company to conduct future screenings for retention, promotion, reassignment access to the Company’s premises or for a continuing relationship with the Company, unless revoked by me in writing. The Company also reserves the right to share the information contained in the report(s) with any third-party companies for whom I will be placed to work or with whom I will have a relationship or will have access to the premises. My information will only be used and/or disclosed as permitted by law and as required for creation of any report(s).</p><p class=\'strong\'> I HEREBY CERTIFY THAT THIS FORM WAS COMPLETED BY ME, THAT THE INFORMATION PROVIDED IS TRUE AND CORRECT AS OF THE DATE HEREOF AND I AUTHORIZE E-VERIFILE TO OBTAIN A CONSUMER REPORT AND/OR INVESTIGATIVE CONSUMER REPORT ON ME, AS APPLICABLE. I acknowledge that the Company has provided with a copy of <a href=\'https://www.consumer.ftc.gov/articles/pdf-0096-fair-credit-reporting-act.pdf\' target=\'_blank\'>A Summary of Your Rights Under the Fair Credit Reporting Act</a>. </p>',
    'releaseType': 'preEmployment'
};

applicationExample = {
    '_id': ObjectId('55257f9f1ba86194e1afc26f'),
    'company': ObjectId('54d12ee8352213f6e8f7f3ee'),
    'job': ObjectId('54d13022352213f6e8f7f3ef'),
    'user': ObjectId('54af4aa84a60c143e96d097c'),
    'modified': '2015-04-08T22:19:12.697Z',
    'created': '2015-04-08T19:21:03.500Z',
    'releases': [releaseExample],
    'messages': [],
    'introduction': '<h3>this is me</h3>\n<p>I like things, and stuff.</p>\n<ul>\n<li>Please read more about me below</li>\n</ul>\n<p>Sometimes I wonder where we are on this world!</p>\n<p>&nbsp;</p>\n<p>this is new</p>',
    'status': 'submitted',
    '__v': 1
};

config = {
    'format': 'Letter',        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
    'orientation': 'portrait', // portrait or landscape

    // Page options
    'border': {
        'top': '0.5in',            // default is 0, units: mm, cm, in, px
        'right': '1in',
        'bottom': '0.5in',
        'left': '1in'
    },

    'header': {
        'height': '.5in',
        'contents': '<div style=\'text-align: center;\'>This is a header thing!</div>'
    },
    'footer': {
        'height': '.5in',
        'contents': '<span style=\'color: #444;\'>{{page}}</span>/<span>{{pages}}</span>'
    },

    // File options
    'type': 'pdf',             // allowed file types: png, jpeg, pdf
    'quality': '75',           // only used for types png & jpeg

    // Script options
    'phantomPath': './node_modules/phantomjs/bin/phantomjs', // PhantomJS binary which should get downloaded automatically
    //'script': '/url',           // Absolute path to a custom phantomjs script, use the file in lib/scripts as example
    'timeout': 30000           // Timeout that will cancel phantomjs, in milliseconds

};
