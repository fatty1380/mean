// screenshots
var fs = require('fs');

function capture(name) {
    browser.takeScreenshot().then(function(png) {
        var stream = fs.createWriteStream('tests/e2e/screenshots/' + name + '.png');
        stream.write(new Buffer(png, 'base64'));
        stream.end();
    });
}

exports.takeScreenshot = function (spec) {
    // capture(( spec.description + new Date() ).split(' ').join('_'));
    capture(spec.description.split(' ').join('_'));
};

exports.takeScreenshotOnFailure = function (spec) {
    if (spec.results().passed()) return;
    // capture(( spec.description + new Date() ).split(' ').join('_'));
    capture(spec.description.split(' ').join('_'));
};

// login



// logout