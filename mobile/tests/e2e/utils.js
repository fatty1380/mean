// screenshots
var fs = require('fs');

module.exports.takeScreenshot = takeScreenshot;
module.exports.takeScreenshotOnFailure = takeScreenshotOnFailure;
module.exports.loginExisting = loginExisting;
module.exports.loginNew = loginNew;


function takeScreenshot(spec) {
    // capture(( spec.description + new Date() ).split(' ').join('_'));
    capture(spec.description.split(' ').join('_'));
}

function takeScreenshotOnFailure(spec) {
    if (spec.results().passed()) return;
    // capture(( spec.description + new Date() ).split(' ').join('_'));
    capture(spec.description.split(' ').join('_'));
}

function capture(name) {
    browser.takeScreenshot().then(function(png) {
        var stream = fs.createWriteStream('tests/e2e/screenshots/' + name + '.png');
        stream.write(new Buffer(png, 'base64'));
        stream.end();
    });
}

function loginExisting() {

}

function loginNew() {

}

// login



// logout