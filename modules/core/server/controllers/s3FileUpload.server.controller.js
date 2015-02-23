'use strict';

var _      = require('lodash'),
    fs     = require('fs'),
    path   = require('path'),
    config = require(path.resolve('./config/config')),
    Q      = require('q'),
    s3     = require('s3');

var client, publicURL;

//exports.saveFileToCloud = saveFile;
exports.saveFileToCloud = directUpload;
exports.uploadToS3 = doS3FileUpload;
exports.getSecureReadURL = getSecureReadURL;

    console.log('\n\n\n\n[s3FileUpload.initClient] ------------------------------------------------------- \n%j\n\n\n', config.services.s3);
    if (!!config.services.s3 && config.services.s3.enabled) {
        var options = config.services.s3;
        options.s3Options = config.services.s3.s3Options;
        client = s3.createClient(options);
        console.log('[s3FileUpload.initClient] configured s3 client');
    } else {
        console.log('[s3FileUpload.initClient] s3 is not enabled: %j', config.services.s3);
    }

function directUpload(files, folder, isSecure) {
    var deferred = Q.defer();


    if (!!client) {
        folder = folder || config.services.s3.folder;

        if (folder.substring(folder.length - 1) === '/') {
            folder = folder.substring(0, folder.length - 1);
        }

        if(files.file) {

            console.log('[s3.directUpload] Attempting S3 Upload for %s to %s', files.file && files.file.name, folder);
            var params = {
                Bucket: config.services.s3.s3Options.bucket,
                Key: folder + '/' + files.file.name,
                ACL: 'public-read',
                Body: files.file.buffer
            };

            console.log('[s3.directUpload] Uploading to bucket `%s` with key `%s`', params.Bucket, params.Key);

            var uploader = client.s3.putObject(params);

            uploader.
                on('success', function (response) {
                    console.log('[s3.directUpload] done uploading, got data! %j', response.data);

                    var publicURL = s3.getPublicUrlHttp(params.Bucket, params.Key);
                    console.log('[s3.directUpload] Got public URL: %s', publicURL);

                    var strippedURL = publicURL.replace('http://', '//');
                    console.log('[s3.directUpload] Post stripping, resolving with : %s', strippedURL);

                    if (isSecure) {
                        response = {
                            key: params.Key,
                            bucket: params.Bucket,
                            url: strippedURL
                        };

                        return getSecureReadURL(response.bucket, response.key).then(
                            function (success) {
                                response.url = success;

                                console.log('[s3.directUpload] Post secure upload, resolving with : %j', response);

                                deferred.resolve(response);
                            }, function (err) {
                                console.log('[s3.directUpload] Post secure upload failed: %j', err);
                                console.log('[s3.directUpload] Resolving with public URL?');

                                deferred.resolve(response);
                            });
                    }
                    else {

                        deferred.resolve(strippedURL);
                    }
                }).
                on('error', function (response) {
                    console.error('[s3.directUpload] unable to upload:', response.error && response.error.stack);

                    deferred.reject(response.error);
                }).
                send();
        } else {
            debugger;
            deferred.reject('No file present in request');
        }
    }
    else {
        console.log('[getFileURL] No S3 Configured - Saving locally');
        return saveLocally(files, folder);
    }

    return deferred.promise;
}

function directRead(key, bucket) {

    var deferred = Q.defer();

    var params = {
        Key: key,
        Bucket: bucket || config.services.s3.s3Options.bucket
    };

    console.log('[s3.directRead] Attempting S3 Download for %j', params);

    var downloader = client.s3.getObject(params);

    downloader.
        on('success', function (response) {
            console.log('[s3.directRead] done downloading, got data w ETag: %s', response.data.ETag);

            console.log('I have no idea!!!!');
            deferred.resolve(response.data.buffer);
        }).
        on('error', function (response) {
            console.error('[s3.directRead] unable to download:', response.error && response.error.stack);

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

    console.log('[s3.directRead] Attempting S3 Download for %j', params);

    var getter = client.s3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
            console.error('[s3.directRead] unable to download:', err && err.stack);

            return deferred.reject(err);
        }

        console.log('[s3.directRead] Got signed url: `%s`', url);

        var strippedURL = url.replace('http://', '//');
        console.log('[s3.directRead] Post stripping, resolving with : %s', strippedURL);

        deferred.resolve(strippedURL);

    });

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
                    console.log('chopping off extra slash from folder name: `%s`', folder);
                    folder = folder.substring(0, folder.length - 1);
                }

                doS3FileUpload(files.file.name, folder)
                    .then(function (url) {
                        console.log('[ChangeProfilePicture.S3] - S3 request completed with url: "%s"', url);

                        return deferred.resolve(url);
                    }, function (err) {
                        console.log('[ChangeProfilePicture.S3] - S3 failed with err: %j', err);

                        var url = config.services.fs.writePath + files.file.name;
                        console.log('[ChangeProfilePicture.S3] resolving with base URL', url);

                        return deferred.resolve(url);

                    });
            }
        }
    );

    return deferred.promise;
}


function saveLocally(files, folder) {

    var deferred = Q.defer();

    fs.writeFile(config.services.fs.writePath + files.file.name, files.file.buffer,
        function (uploadError) {
            if (uploadError) {
                deferred.reject(uploadError);
            } else {
                folder = folder || config.services.s3.folder;

                if (folder.substring(folder.length - 1, 1) === '/') {
                    console.log('chopping off extra slash from folder name: `%s`', folder);
                    folder = folder.substring(0, folder.length - 1);
                }

                var url = config.services.fs.writePath + files.file.name;
                console.log('[SaveLocally.S3] resolving with URL', url);

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

        console.log('[getFileURL] Attempting S3 Upload for %s to %s', filename, folder);
        var params = {
            localFile: localFileLocation,

            s3Params: {
                Bucket: config.services.s3.s3Options.bucket,
                Key: folder + '/' + filename,
                ACL: 'public-read'
            }
        };

        console.log('[getFileURL] Uploading with parameters: %j', params);


        var uploader = client.uploadFile(params);
        uploader.on('error', function (err) {
            console.error('[getFileURL] unable to upload:', err.stack);

            deferred.reject(err);
        });
        uploader.on('end', function (data) {
            console.log('[getFileURL] done uploading, got data: %j', data);

            var publicURL = s3.getPublicUrlHttp(params.s3Params.Bucket, params.s3Params.Key);

            console.log('[getFileURL] Got public URL: %s', publicURL);

            deferred.resolve(publicURL);
        });
    }
    else {

        console.log('[getFileURL] No S3 Configured - using local url: %s', publicURL);
        return deferred.resolve(localFileLocation);
    }

    return deferred.promise;
}
