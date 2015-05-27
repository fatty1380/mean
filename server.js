'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
chalk      = require('chalk'),
mongoose   = require('./config/lib/mongoose'),
express    = require('./config/lib/express'),
log        = require('./config/lib/logger');

// Initialize mongoose
mongoose.connect(function (db) {

    log.info('-- Mongoose Connection Initialized --');

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
    log.info('--', 'black');
    log.info(config.app.title + ' application started', 'green');
    log.info('Environment:\t\t\t' + process.env.NODE_ENV, 'green');
    log.info('Port:\t\t\t\t' + config.port, 'green');
    log.info('Database:\t\t\t\t' + config.db.uri, 'green');
    if (config.https.enabled) {
        if(!!app.https) {
            log.info('HTTPs:\t\t\t\ton:%s', config.https.port, 'green');
        }
        else {
            log.error('HTTPs:\t\t\t\terror:%s', config.https.port);
        }
    }
    log.info('--', 'black');
});

