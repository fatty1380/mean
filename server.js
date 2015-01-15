'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
chalk      = require('chalk'),
mongoose   = require('./config/lib/mongoose'),
express    = require('./config/lib/express');

// Initialize mongoose
mongoose.connect(function (db) {

    // Init 'rootRequire' function:
    global.rootRequire = function (name) {
        console.log('[RootRequire] %s | %s', __dirname, name);
        var res = require(__dirname + '/' + name);
        console.log('[RootRequire] got %s for %s', JSON.stringify(res), name.substring(1 + name.lastIndexOf('/')));
        return res;
    };

    // Initialize express
    var app = express.init(db);

    // Start the app by listening on <port>
    app.http.listen(config.port);

    if(app.https) {
        app.https.listen(config.https.port);
    }

    // Logging initialization
    console.log('--');
    console.log(chalk.green(config.app.title + ' application started'));
    console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
    console.log(chalk.green('Port:\t\t\t\t' + config.port));
    console.log(chalk.green('Database:\t\t\t' + config.db.uri));
    if (config.https.enabled) {
        if(!!app.https) {
            console.log(chalk.green('HTTPs:\t\t\t\ton:%s'), config.https.port);
        }
        else {
            console.log(chalk.red('HTTPs:\t\t\t\terror:%s'), config.https.port);
        }
    }
    console.log('--');
});
