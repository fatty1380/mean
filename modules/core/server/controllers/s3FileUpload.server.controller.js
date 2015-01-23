'use strict';

var _        = require('lodash'),
    fs           = require('fs'),
    path         = require('path'),
    config       = require(path.resolve('./config/config')),
    Q            = require('q'),
    s3 = require('s3');

var client, publicURL;

if (!!config.services.s3 && config.services.s3.enabled) {
    var options = config.services.s3.clientConfig;
    options.s3Options = config.services.s3.s3Options;
    client = s3.createClient(options);
}

exports.saveFileToCloud = saveFile;
exports.uploadToS3 = doS3FileUpload;

function saveFile(files, folder) {

    var deferred = Q.defer();

    fs.writeFile(config.services.fs.writePath + files.file.name, files.file.buffer,
        function (uploadError) {
            if (uploadError) {
                deferred.reject(uploadError);
            } else {
                folder = folder || config.services.s3.folder;

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
