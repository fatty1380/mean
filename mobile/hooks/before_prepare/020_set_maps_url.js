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

function fixMapsURL(staticMapsPath) {
    // add the platform class to the body tag
    try {

        var httpsSrc = '\'https://maps';
        var rawSrc = '\'//maps';

        var source = fs.readFileSync(staticMapsPath, 'utf8');

        var baseURLLine = findBaseURLAssignment(source);
        process.stdout.write('BaseURL Tag: `' + baseURLLine + '`\n');
        if (!baseURLLine) return; // no opening body tag, something's wrong

        if (baseURLLine.indexOf(httpsSrc) > -1) return; // already added

        process.stdout.write('Generic URL Protocol Present ... Fixing\n');
        var newURLAssignmentLine = baseURLLine;

        newURLAssignmentLine = baseURLLine.replace(rawSrc, httpsSrc);

        source = source.replace(baseURLLine, newURLAssignmentLine);

        fs.writeFileSync(staticMapsPath, source, 'utf8');

        process.stdout.write('Set StaticMaps URL to: ' + newURLAssignmentLine + '\n');
    } catch (e) {
        process.stdout.write(e);
    }
}

function findBaseURLAssignment(source) {
    // get the body tag
    try {
        return source.match(/var BASE_URL = '(\/\/)maps\.googleapis\.com\//gi)[0];
    } catch (e) { }
}

if (rootdir) {
        process.stdout.write('Starting from path: `' + rootdir + '`\n');        

    try {
        var indexPath = path.join('www', 'lib', 'angular-google-staticmaps', 'angular-google-staticmaps.js');

        process.stdout.write('Loading staticmaps from path: `' + indexPath + '`\n');        
        
        if (fs.existsSync(indexPath)) {
            process.stdout.write('FS Exists\n');
            fixMapsURL(indexPath);
        }

    } catch (e) {
        process.stdout.write(e);
    }

}
