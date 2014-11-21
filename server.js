'use strict';

/**
 * Module dependencies.
 */
var config = require('./config/config'),
    mongoose = require('./config/lib/mongoose'),
    express = require('./config/lib/express');

// Initialize mongoose
mongoose.connect(function(db) {

    // Init 'rootRequire' function:
    global.rootRequire = function(name) {
        console.log('[RootRequire] %s | %s', __dirname, name);
        var res = require(__dirname + '/' + name);
        console.log('[RootRequire] got %s for %s', JSON.stringify(res), name.substring(1+name.lastIndexOf('/')));
        return res;
    };

    // Initialize express
    var app = express.init(db);

    // Start the app by listening on <port>
    app.listen(config.port);

    // Logging initialization
    console.log('MEAN.JS application started on port ' + config.port);
});
