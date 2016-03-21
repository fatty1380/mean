// screenshots
var fs = require('fs');

module.exports.capture = capture;

function capture(name) {
    browser.takeScreenshot().then(function(png) {
        var stream = fs.createWriteStream('tests/e2e/screenshots/' + name + '.png');
        stream.write(new Buffer(png, 'base64'));
        stream.end();
    });
}

