'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    Q = require('q'),
    s3 = require('s3'),
    uuid = require('node-uuid'),
    mime = require('mime-types'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'core',
        file: 's3FileUpload.service'
    });

var client, publicURL;


/////////////////
var awsPromised = require('aws-promised');
var s3Promised = awsPromised.s3();

var options = config.services.s3;
options.s3Options = config.services.s3.s3Options;
//////////////////////////////

//exports.saveFileToCloud = saveFile;
exports.saveFileToCloud = directUpload;
exports.saveContentToCloud = saveContentToCloud;
exports.uploadToS3 = doS3FileUpload;
exports.getSecureReadURL = getSecureReadURL;

////////////////////////////////////////////////////////////////////////////////////
//		Initialization         													  //
////////////////////////////////////////////////////////////////////////////////////

(function initialize() {
    log.trace({ func: 'initialize', config: config.services.s3 });
    if (!!config.services.s3 && config.services.s3.enabled) {
        var options = config.services.s3;
        options.s3Options = config.services.s3.s3Options;
        
        client = s3.createClient(options);
        log.trace({ func: 'initialize' }, 'configured s3 client');
    } else {
        log.debug({ func: 'initialize' }, 's3 is not enabled');
    }
})();

////////////////////////////////////////////////////////////////////////////////////
//		Public Method Implementation Logic										  //
////////////////////////////////////////////////////////////////////////////////////


function directUpload(files, folder, isSecure) {
    if (!!client) {
        log.debug({ func: 'directUpload' }, 'Uploading to S3');
        return doDirectUpload(files, folder, isSecure);
    }
    else {
        log.debug({ func: 'directUpload' }, 'No S3 Configured - Saving locally');
        return saveLocally(files, folder);
    }
}

var uriRegex = /^data:(.+\/.+);(\w+),(.*)$/;

/**
 * saveContentToCloud
 */
function saveContentToCloud(data) {
    log.debug({ trace: 'saveContentToCloud', data: data }, 'START');

    var file = {
        name: data.filename
    };

    var isSecure = _.isUndefined(data.isSecure) ? true : !!data.isSecure;

    if (/^data:/i.test(data.content)) {
        var matches = data.content.match(uriRegex);
        file.contentType = matches[1];
        file.encoding = matches[2];
        file.buffer = new Buffer(matches[3], file.encoding);

    } else {
        file.buffer = (data.content instanceof Buffer) ? data.content : new Buffer(data.content, 'utf-8');
    }

    debugger;
    log.trace({ func: 'saveContentToCloud', isSecure: isSecure, contentType: file.contentType, encoding :file.encoding,  dataContentLength: file.buffer.toString().length });

    if (_.isEmpty(file.name)) {
        file.name = [data.userId || uuid.v4(), mime.extension(file.contentType)].join('.');
    }

    //return Q(directUpload({file: file}, null, true));
    return directUpload({ file: file }, data.folder || null, isSecure)
        .then(
            function (success) {
                log.debug({ func: 'saveContentToCloud', result: success }, 'Returning promise');

                return success;
            },
            function (err) {
                log.error({ func: 'saveContentToCloud', error: err }, 'Returning promise');

                return Q.reject(err);
            });
}

/**
 * doS3FileUpload
 */
function doS3FileUpload(filename, folder) {
    var deferred = Q.defer();

    var localFileLocation = config.services.fs.writePath + filename;
    if (!!client) {

        log.debug('[getFileURL] Attempting S3 Upload for %s to %s', filename, folder);
        var params = {
            localFile: localFileLocation,

            s3Params: {
                Bucket: config.services.s3.s3Options.bucket,
                Key: folder + '/' + filename,
                ACL: 'public-read'
            }
        };

        log.debug('[getFileURL] Uploading with parameters: %j', params);


        var uploader = client.uploadFile(params);

        uploader.on('error', function (err) {
            log.error('[getFileURL] unable to upload:', err.stack);

            deferred.reject(err);
        });
        uploader.on('end', function (data) {
            log.debug('[getFileURL] done uploading, got data: %j', data);

            var publicURL = s3.getPublicUrlHttp(params.s3Params.Bucket, params.s3Params.Key);

            log.debug('[getFileURL] Got public URL: %s', publicURL);

            deferred.resolve(publicURL);
        });
    }
    else {

        log.debug('[getFileURL] No S3 Configured - using local url: %s', publicURL);
        return deferred.resolve(localFileLocation);
    }

    return deferred.promise;
}  

function getSecureReadURL(bucket, key) {

    var deferred = Q.defer();

    var params = {
        Key: key,
        Bucket: bucket || config.services.s3.s3Options.bucket
    };

    if (!client) {
        log.debug('[s3.directRead] S3 is not configured - cannot update secure read url');
        deferred.reject('Unable to update file from cloud store');
    } else {

        log.debug('[s3.directRead] Attempting S3 Download for %j', params);

        client.s3.getSignedUrl('getObject', params, function (err, url) {
            if (err) {
                log.error('[s3.directRead] unable to download:', err && err.stack);

                return deferred.reject(err);
            }

            log.debug('[s3.directRead] Got signed url: `%s`', url);

            var strippedURL = url.replace('http://', 'https://'); //.replace('https://', '//');
            log.debug('[s3.directRead] Post stripping, resolving with : %s', strippedURL);

            deferred.resolve(strippedURL);

        });
    }

    return deferred.promise;
}




////////////////////////////////////////////////////////////////////////////////////
//		Private Methods     													  //
////////////////////////////////////////////////////////////////////////////////////



/// needs to return a promise
function doDirectUpload(files, folder, isSecure) {

    var deferred = Q.defer();

    folder = folder || (!!isSecure ? 'lockbox' : config.services.s3.folder);
    if (folder.substring(folder.length - 1) === '/') {
        folder = folder.substring(0, folder.length - 1);
    }

    var file = files.file;

    log.debug({ func: 'directUpload' }, 'Uploading file: %s',
        JSON.stringify(file, function (key, value) {
        return (key === 'buffer') ? '<BufferLength:' + value.length + '>' : value;
    }, 2));

    if (file) {
        var fileName = _.contains(file.path, file.name) ?
            file.originalname :
            file && file.name || file.originalname;

        var extension;

        if (!!fileName) {
            extension = !!fileName ? (file.extension || fileName.slice(-3)).toLowerCase() : null;
        } else {
            fileName = uuid.v4();
        }

        log.debug({ func: 'directUpload' }, 'Initializing S3 Upload for %s to %s', fileName, folder);

        var params = {
            Bucket: config.services.s3.s3Options.bucket,
            Key: folder + '/' + fileName,
            ACL: !!isSecure ? 'private' : 'public-read',
            Body: file.buffer
        };

        if (!!file.contentType) {
            params.ContentType = file.contentType;
        } else {
            switch (extension) {
                case 'pdf':
                    params.ContentType = 'application/pdf';
                    break;
            }
        }
        log.debug({ func: 'directUpload', contentType: params.ContentType }, 'Set content type to `%s`', params.ContentType);

        if (!!file.contentEncoding) {
            params.ContentEncoding = file.contentEncoding;
            log.debug({ func: 'directUpload', contentType: params.ContentEncoding }, 'Set content encoding to `%s`', params.ContentEncoding);
        }

        log.debug({ func: 'directUpload' }, 'Uploading file with params: %s',
            JSON.stringify(params, function (key, value) {
                return (key === 'Body') ? '<BufferLength:' + value.length + '>' : value;
            }, 2));



        doUploadPromise(params).then(
            function success(uploadResult) {

                log.debug({ func: 'directUpload', result: uploadResult }, 'Uploaded File');

                // if (isSecure) {
                //     return secureDocument(uploadResult);
                // }

                return uploadResult;
            },
            function caught(err) {
                var uploader = initializeUploader(params, isSecure, deferred);
                log.debug({ func: 'directUpload' }, 'Event Handlers in place');

                uploader.send();
            })
            .then(function success(saveSecureResult) {

                if (_.isEmpty(saveSecureResult)) {
                    // Assume deferred is clea
                    return;
                }

                log.debug({ func: 'directUpload', result: saveSecureResult }, 'Resolving with final result');
                deferred.resolve(saveSecureResult);

            });
    } else {
        debugger;
        deferred.reject('No file present in request');
    }

    return deferred.promise;
}

//var pClient = s3Promised.createClient(options);

function doUploadPromise(params, isSecure) {
    if (!s3Promised) {
        log.error({ func: 'doUpload' }, 's3Promised is not defined');
        return Q.reject('s3 Promised is not defined');
    }

    return s3Promised.putObjectPromised(params)
        .then(function success(response) {
            log.info({ func: 'doUpload', responseData: response.data }, 'done uploading, got data!');
            log.debug({ func: 'doUpload', response: response }, 'done uploading, full response object!');

            if (!!isSecure) {
                return s3Promised.getSignedUrl('getObject', params);
            }
            return s3Promised.getPublicUrlHttp(params.Bucket, params.Key);
        })
        .then(function (fileURL) {
            
            log.debug({ func: 'doUpload' }, 'Got  URL: %s', fileURL);

            var strippedURL = fileURL.replace('http://', 'https://');
            log.debug({ func: 'doUpload' }, 'Post stripping, resolving with : %s', strippedURL);

            return {
                key: params.Key,
                bucket: params.Bucket,
                url: strippedURL,
                timestamp: Date.now(),
                expires: !!isSecure ? (Date.now() + 15 * 60 * 1000) : undefined
            };
        });
}

function secureDocument(document) {
    // response = {
    //     key: params.Key,
    //     bucket: params.Bucket,
    //     url: strippedURL,
    //     timestamp: Date.now(),
    //     expires: Date.now()
    // };

    return getSecureReadURL(document.bucket, document.key).then(
        function (success) {
            document.url = success;
            document.expires = (Date.now() + 15 * 60 * 1000);

            log.debug({ func: 'initializeUploader:onSuccess' }, 'Post secure upload, resolving with : %j', document);

            return Q.resolve(document);
        }, function (err) {
            log.debug({ func: 'initializeUploader:onSuccess' }, 'Post secure upload failed: %j', err);
            log.debug({ func: 'initializeUploader:onSuccess' }, 'Resolving with public URL?');

            return Q.reject(document);
        });
}
/////////////////////////////////


function initializeUploader(params, isSecure, deferred) {
    var uploader = client.s3.putObject(params);

    log.debug({ func: 'initializeUploader' }, 'Initializing Uploader');

    uploader.
        on('success', function (response) {
            console.log('Logger is%s defined', _.isEmpty(log) ? ' NOT' : '');
            log.debug({ func: 'initializeUploader:onSuccess', response: response.data }, 'done uploading, got data!');

            var publicURL = s3.getPublicUrlHttp(params.Bucket, params.Key);
            log.debug({ func: 'initializeUploader:onSuccess' }, 'Got public URL: %s', publicURL);

            var strippedURL = publicURL.replace('http://', 'https://');
            log.debug({ func: 'initializeUploader:onSuccess' }, 'Post stripping, resolving with : %s', strippedURL);

            if (isSecure) {
                response = {
                    key: params.Key,
                    bucket: params.Bucket,
                    url: strippedURL,
                    timestamp: Date.now(),
                    expires: Date.now()
                };

                return getSecureReadURL(response.bucket, response.key).then(
                    function (success) {
                        response.url = success;
                        response.expires = (Date.now() + 15 * 60 * 1000);

                        log.debug({ func: 'initializeUploader:onSuccess' }, 'Post secure upload, resolving with : %j', response);

                        deferred.resolve(response);
                    }, function (err) {
                        log.debug({ func: 'initializeUploader:onSuccess' }, 'Post secure upload failed: %j', err);
                        log.debug({ func: 'initializeUploader:onSuccess' }, 'Resolving with public URL?');

                        deferred.resolve(response);
                    });
            }
            else {
                response = {
                    key: params.Key,
                    bucket: params.Bucket,
                    url: strippedURL,
                    timestamp: Date.now()
                };

                deferred.resolve(response);
            }
        }).
        on('error', function (response) {
            log.error({ func: 'initializeUploader:onError', response: response }, 'File upload failed: `%s`', response.message);

            deferred.reject(response);
        });

    log.debug({ func: 'initializeUploader' }, 'Uploader Initialized and Events Registered');

    return uploader;

}

function directRead(key, bucket) {

    var deferred = Q.defer();

    var params = {
        Key: key,
        Bucket: bucket || config.services.s3.s3Options.bucket
    };

    log.debug('[s3.directRead] Attempting S3 Download for %j', params);

    var downloader = client.s3.getObject(params);

    downloader.
        on('success', function (response) {
            log.debug('[s3.directRead] done downloading, got data w ETag: %s', response.data.ETag);

            log.debug('I have no idea!!!!');
            deferred.resolve(response.data.buffer);
        }).
        on('error', function (response) {
            log.error('[s3.directRead] unable to download:', response.error && response.error.stack);

            deferred.reject(response.error);
        }).
        send();

    return deferred.promise;
}
/**
 * saveLocally
 * -----------
 * Given a file (in the files object) and a local folder name, writes that file to the local
 * filesystem. This is primarily used for testing purposes or as a fallback
 */
function saveLocally(files, folder) {

    var deferred = Q.defer();

    var tmp = _.cloneDeep(files.file);
    tmp.buffer = '[Omitted]';

    log.debug('[FileUpload.saveLocally] Saving file: %s', JSON.stringify(tmp, null, 2));

    fs.writeFile(config.services.fs.writePath + files.file.name, files.file.buffer,
        function (uploadError) {
            if (uploadError) {
                deferred.reject(uploadError);
            } else {
                folder = folder || config.services.s3.folder;

                if (folder.substring(folder.length - 1, 1) === '/') {
                    log.debug('chopping off extra slash from folder name: `%s`', folder);
                    folder = folder.substring(0, folder.length - 1);
                }

                var url = config.services.fs.writePath + files.file.name;

                url = url.replace('/client/', '/');
                log.debug('[SaveLocally.S3] resolving with URL', url);

                return deferred.resolve(url);
            }
        }
        );

    return deferred.promise;
}

/**
 * saveFile
 * ========
 * @deprecated : Former implementation of `saveFileToCloud`
 */
function saveFile(files, folder) {

    var deferred = Q.defer();

    fs.writeFile(config.services.fs.writePath + files.file.name, files.file.buffer,
        function (uploadError) {
            if (uploadError) {
                deferred.reject(uploadError);
            } else {
                folder = folder || config.services.s3.folder;

                if (folder.substring(folder.length - 1, 1) === '/') {
                    log.debug('chopping off extra slash from folder name: `%s`', folder);
                    folder = folder.substring(0, folder.length - 1);
                }

                doS3FileUpload(files.file.name, folder)
                    .then(function (url) {
                        log.debug('[ChangeProfilePicture.S3] - S3 request completed with url: "%s"', url);

                        return deferred.resolve(url);
                    }, function (err) {
                        log.debug('[ChangeProfilePicture.S3] - S3 failed with err: %j', err);

                        var url = config.services.fs.writePath + files.file.name;
                        log.debug('[ChangeProfilePicture.S3] resolving with base URL', url);

                        return deferred.resolve(url);

                    });
            }
        }
        );

    return deferred.promise;
}

// ============================================================================================


/********************************************************************************************
 * Instance Methods
 */

function getContentType(content) {
    var matches = content.match(/^data:(\w+\/\w+);/i);

    log.debug({ matches: matches, last: _.last(matches) }, 'Got Content type regex');

    return _.last(matches);
}

function getFolder(folderBase) {
    var folder = folderBase || config.services.s3.folder;

    if (folder.substring(folder.length - 1) === '/') {
        folder = folder.substring(0, folder.length - 1);
    }
}
