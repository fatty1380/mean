#!/usr/bin/env node

// Add Platform Class
// v1.0
// Automatically adds the platform class to the body tag
// after the `prepare` command. By placing the platform CSS classes
// directly in the HTML built for the platform, it speeds up
// rendering the correct layout/style for the specific platform
// instead of waiting for the JS to figure out the correct classes.

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

function addPlatformBodyTag(indexPath, platform) {
    process.stdout.write('Reviewing iOS Tag at Path: `' + indexPath + '`\n');
    // add the platform class to the body tag
    try {
        var cordovaSrc = 'lib/ngCordova/dist/ng-cordova.js';
        var mocksSrc = 'lib/ngCordova/dist/ng-cordova-mocks.js';

        var html = fs.readFileSync(indexPath, 'utf8');

        var cordovaTag = findCordovaTag(html);
        process.stdout.write('Cordova Tag: `' + cordovaTag + '`\n');
        if (!cordovaTag) return; // no opening body tag, something's wrong

        if (cordovaTag.indexOf(cordovaSrc) > -1) return; // already added

        process.stdout.write('Cordova Mocks Present ... Removing\n');
        var newCordovaTag = cordovaTag;

        var srcAttr = findSrcAttr(cordovaTag);
        if (srcAttr) {
            newCordovaTag = cordovaTag.replace(mocksSrc, cordovaSrc);
        }

        html = html.replace(cordovaTag, newCordovaTag);

        fs.writeFileSync(indexPath, html, 'utf8');

        process.stdout.write('Set Cordova Source: ' + cordovaSrc + '\n');
    } catch (e) {
        process.stdout.write(e);
    }
}

function findCordovaTag(html) {
    // get the body tag
    try {
        return html.match(/<script .*(ng-cordova.*\.js).*>/gi)[0];
    } catch (e) { }
}

function findSrcAttr(bodyTag) {
    // get the body tag's class attribute
    try {
        return bodyTag.match(/ src=["|'](.*?)["|']/gi)[0];
    } catch (e) { }
}

if (rootdir) {

    // go through each of the platform directories that have been prepared
    var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

    for (var x = 0; x < platforms.length; x++) {
        // open up the index.html file at the www root
        try {
            var platform = platforms[x].trim().toLowerCase();
            var indexPath;

            if (platform == 'android') {
                indexPath = path.join('platforms', platform, 'assets', 'www', 'index.html');
            } else {
                indexPath = path.join('platforms', platform, 'www', 'index.html');
            }

            if (fs.existsSync(indexPath)) {
                addPlatformBodyTag(indexPath, platform);
            }

            process.stdout.write('SET CORDOVA LIB : Round 2 --------------------------------\n');


            if (fs.existsSync(indexPath)) {
                addPlatformBodyTag(indexPath, platform);
            }


        } catch (e) {
            process.stdout.write(e);
        }
    }

}
