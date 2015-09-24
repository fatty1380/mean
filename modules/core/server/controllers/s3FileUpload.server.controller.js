'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    config = require(path.resolve('./config/config')),
    Q = require('q'),
    s3 = require('s3'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'core',
        file: 's3FileUpload.service'
    });

var client, publicURL;

//exports.saveFileToCloud = saveFile;
exports.saveFileToCloud = directUpload;
exports.saveContentToCloud = uploadContentToCloud;
exports.uploadToS3 = doS3FileUpload;
exports.getSecureReadURL = getSecureReadURL;

log.debug('\n\n\n\n[s3FileUpload.initClient] ------------------------------------------------------- \n%j\n\n\n', config.services.s3);
if (!!config.services.s3 && config.services.s3.enabled) {
    var options = config.services.s3;
    options.s3Options = config.services.s3.s3Options;
    client = s3.createClient(options);
    log.debug('[s3FileUpload.initClient] configured s3 client');
} else {
    log.debug('[s3FileUpload.initClient] s3 is not enabled: %j', config.services.s3);
}

function uploadContentToCloud(data) {
    log.trace({ func: 'uploadContentToCloud' }, 'START');

    var buffer = (data.content instanceof Buffer) ? data.content : new Buffer(data.content, 'utf-8');

    log.trace({ func: 'uploadContentToCloud', dataContentLength: buffer.toString().length });

    var file = {
        name: data.filename,
        buffer: buffer
    };

    //return Q(directUpload({file: file}, null, true));
    var p = directUpload({ file: file }, null, true);

    return p.then(function (success) {
        log.debug({ func: 'uploadContentToCloud', result: success }, 'Returning promise');

        return success;
    },
        function (err) {
            log.error({ func: 'uploadContentToCloud', error: err }, 'Returning promise');

            return Q.reject(err);
        });
}

function directUpload(files, folder, isSecure) {
    var deferred = Q.defer();

    if (!!client) {
        doDirectUpload(files, folder, isSecure, deferred);
    }
    else {
        log.debug('[getFileURL] No S3 Configured - Saving locally');
        return saveLocally(files, folder);
    }

    log.trace({ func: 'directUpload' }, 'Returning promise');
    return deferred.promise;
}

function doDirectUpload(files, folder, isSecure, deferred) {
    folder = folder || config.services.s3.folder;

    if (folder.substring(folder.length - 1) === '/') {
        folder = folder.substring(0, folder.length - 1);
    }

    var file = files.file;

    log.debug({ func: 'directUpload' }, 'Uploading file: %s', JSON.stringify(file, function (key, value) {
        return (key === 'buffer') ? '<BufferLength:' + value.length + '>' : value;
    }, 2));

    if (file) {
        var fileName = _.contains(file.path, file.name) ? file.originalname : file && file.name || file.originalname;

        log.debug({ func: 'directUpload' }, 'Attempting S3 Upload for %s to %s', fileName, folder);
        var params = {
            Bucket: config.services.s3.s3Options.bucket,
            Key: folder + '/' + fileName,
            ACL: 'public-read',
            Body: file.buffer
        };

        if (!!file.contentType) {
            params.ContentType = file.contentType;
        } else {
            switch ((file.extension || fileName.slice(-3)).toLowerCase()) {
                case 'pdf':
                    params.ContentType = 'application/pdf';
                    break;
            }
        }

        if (!!file.contentEncoding) {
            params.ContentEncoding = file.contentEncoding;
        }

        log.debug({ func: 'directUpload' }, 'Uploading file with params: %s', JSON.stringify(params, function (key, value) {
            return (key === 'Body') ? '<BufferLength:' + value.length + '>' : value;
        }, 2));

        var uploader = initializeUploader(params, isSecure, deferred);


        log.debug({ func: 'directUpload' }, 'Event Handlers in place');

        uploader.send();
    } else {
        debugger;
        deferred.reject('No file present in request');
    }
}

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
