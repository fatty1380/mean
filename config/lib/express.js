'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
    _ = require('lodash'),
    chalk = require('chalk'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    multer = require('multer'),
    favicon = require('serve-favicon'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    cors = require('cors'),
    passport = require('passport'),
    flash = require('connect-flash'),
    consolidate = require('consolidate'),
    addRequestId = require('express-request-id')(),
    path = require('path'),
    log = require(path.resolve('./config/lib/logger')).child({
        module: 'lib',
        file: 'express'
    }),
    fs = require('fs'),
    http = require('http'),
    https = require('https');

var expressJwt = require('express-jwt'),
    jwt = require('jsonwebtoken');

var reqIndex = 0;

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function (app) {
    log.trace({ func: 'initLocalVariables' }, 'Initializing Local Variables');

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
    app.locals.googleAnalyticsTrackingID = config.services.google.analyticsTrackingID;
    app.locals.facebookAppId = config.facebook.clientID;
    app.locals.jsFiles = config.files.client.js;
    app.locals.cssFiles = config.files.client.css;
    app.locals.fontFiles = config.files.client.font;
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function (app) {
    log.trace({ func: 'initMiddleware' }, 'START Initializing Middleware');
    // Showing stack errors
    app.set('showStackError', true);

    // Should be placed before express.static
    app.use(compress({
        filter: function (req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    // Initialize favicon middleware
    app.use(favicon('./modules/core/client/img/brand/favicon.ico'));
    
    // Init a unique Request ID
    app.use(addRequestId);

    // Initializ the per-request loggger
    app.use(function (req, res, next) {
        req.log = log.child({
            req: req,
            req_id: req.id
        });

        next();
    });

    var accessLogStream, streamType;

    // Passing the request url to environment locals
    app.use(function (req, res, next) {
        res.locals.host = req.protocol + '://' + req.hostname;
        res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
        next();
    });

    log.info(config.https, 'EXPRESS ROUTER HTTPS Config');

    if (process.env.NODE_ENV === 'production' || (config.https.enabled)) {
        app.use(function (req, res, next) {
            if (/elasticbeanstalk/.test(req.headers.host)) {
                return next();
            }
            if ((!req.secure) && (!!req.headers['x-forwarded-proto']) && req.headers['x-forwarded-proto'].toLowerCase() === 'http') {
                log.info('[EXPRESS.ROUTER] HTTPS Redirect %s', req.headers.host);
                return res.redirect(['https://', req.headers.host, req.url].join(''));
            }
            return next();
        });
    }

    if (process.env.NODE_ENV !== 'production') {
        var errorhandler = require('errorhandler');

        app.use(errorhandler({ log: function errorNotification(err, str, req) {
            var title = 'Error in ' + req.method + ' ' + req.url;

            req.log.error({
                title: title,
                method: req.method,
                url: req.url,
                error: err
            }, str);
        } }));
    }

    // Environment dependent middleware
    if (process.env.NODE_ENV !== 'production') {
        // Disable views cache
        app.set('view cache', false);

        streamType = 'dev';
    } else {
        app.locals.cache = 'memory';

        streamType = 'combined';
    }

    if (!!config.logs.access) {
        var exist = fs.existsSync(config.logs.access);
        var perm = fs.statSync(config.logs.access, 2);
        if (exist && perm) {
            // Enable logger (morgan) write to access.log file.
            accessLogStream = fs.createWriteStream(config.logs.access + 'express_access.log', {
                flags: 'a'
            });
            app.use(morgan('combined', {
                stream: accessLogStream
            }));
        }
    }
    else {
        // Enable logger (morgan)
        app.use(morgan(streamType));
    }

    if (process.env.NODE_ENV === 'development') {
        
        
        // log.info({ func: 'initMiddleware' }, 'Configuring CORS Specific headers and OPTIONS for development only');
        // app.use();
    } 
    
    log.info({ func: 'initLocalVariables', options: config.security.cors }, 'Enabling CORS for Mobile Application');

    var whitelist = config.security.cors.whitelist || [];
    var corsOptions = !!whitelist.length ? {
        origin: whitelist
        // function(origin, callback) {
        //     var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        //     log.debug({ func: 'corsOptions', origin: origin, whitelist: whitelist, isValid: originIsWhitelisted }, 'evaluating origin for CORS validity');
        //     callback(null, originIsWhitelisted);
        // }
    } : {};

    //app.use(cors(corsOptions));
    app.use(cors());
    
    /// JWT???
    //app.use('/api', expressJwt({ secret: config.sessionSecret }));
    //app.use('/api', expressJwt({ secret: config.sessionSecret }));
    
    // Authenticate with Passport-Bearer Authentication, and only
    // fail in case of exception/error - not failed auth.
    app.use('/api', function (req, res, next) {
        if (_.isEmpty(req.headers.authorization)) {
            return next();
        }

        passport.authenticate('bearer', { session: false },
            function cb(err, user, info) {
                if (err) { return next(err); }
                
                if (!!user) {
                    // Since We're using custom-middleware for passport, we need to 
                    // set the request user ourselves.
                    req.user = user;
                }
                
                return next();
            })(req, res, next);
    });


    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        limit: '10mb',
        extended: true
    }));
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(methodOverride());

    // Add the cookie parser and flash middleware
    app.use(cookieParser());
    app.use(flash());

    // Add multipart handling middleware
    app.use(multer({
        dest: './uploads/',
        inMemory: true
    }));

    log.trace({ func: 'initLocalVariables' }, 'Completed Initializing Middleware');
};

/**
 * Configure view engine
 */
module.exports.initViewEngine = function (app) {
    log.trace({ func: 'initViewEngine' }, 'Initializing View Engine');

    // Set swig as the template engine
    app.engine('server.view.html', consolidate[config.templateEngine]);

    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', './');
};

/**
 * Configure Express session
 */
module.exports.initSession = function (app, db) {
    
    if (config.security.enableSession) {
        log.trace({ func: 'initSession' }, 'Initializing Session');

        // Express MongoDB session storage
        app.use(session({
            saveUninitialized: true,
            resave: true,
            secret: config.sessionSecret,
            store: new MongoStore({
                mongooseConnection: db.connection,
                collection: config.sessionCollection
            })
        }));
    }
};

/**
 * Invoke modules server configuration
 */
module.exports.initModulesConfiguration = function (app, db) {
    log.trace({ func: 'initModulesConfiguration' }, 'Initializing Modules Configuration');

    config.files.server.configs.forEach(function (configPath) {
        require(path.resolve(configPath))(app, db);
    });
    log.trace({ func: 'initModulesConfiguration' }, 'Completed Modules Configuration');
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = function (app) {
    log.trace({ func: 'initHelmetHeaders' }, 'Initializing Helmet Headers');

    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');
};

/**
 * Configure the modules static routes
 */
module.exports.initModulesClientRoutes = function (app) {
    log.trace({ func: 'initModulesClientRoutes' }, 'Initializing Modules Client Routes');

    // Setting the app router and static folder
    app.use('/', express.static(path.resolve('./public')));

    // Globbing static routing
    config.folders.client.forEach(function (staticPath) {
        app.use(staticPath.replace('/client', ''), express.static(path.resolve('./' + staticPath)));
    });
};

/**
 * Configure the modules ACL policies
 */
module.exports.initModulesServerPolicies = function (app) {
    log.trace({ func: 'initModulesServerPolicies' }, 'Initializing Modules Server Policies');

    // Globbing policy files
    config.files.server.policies.forEach(function (policyPath) {
        log.trace({ func: 'initModulesServerPolicies' }, 'Resolving policy path `%s`', policyPath);
        require(path.resolve(policyPath)).invokeRolesPolicies();
    });
};

/**
 * Configure the modules server routes
 */
module.exports.initModulesServerRoutes = function (app) {
    log.trace({ func: 'initModulesServerRoutes' }, 'Initializing Modules Server Routes');

    // Globbing routing files
    config.files.server.routes.forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (app) {
    log.trace({ func: 'initErrorRoutes' }, 'Initializing Error Routes');

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function (err, req, res, next) {
        // If the error object doesn't exists
        if (!err) {
            return next();
        }

        // Log it
        console.error(err.stack);

        // Redirect to error page
        //res.redirect('/server-error');
        res.status(500).json({ error: err.stack });
    });

    // Assume 404 since no middleware responded
    app.use(function (req, res) {
        // Redirect to not found page
        //log.error({ func: 'noMiddleware', err: 'umm', url: req && req.url, status: res && res.status }, 'Assuming 404, unless Headers are already set');
        
        if (!res.headersSent) {
            res.status(404).json({ error: 'not found' });

            if (!/^\/api\/.*/i.test(req.url)) {
                res.redirect('/not-found');
            }
        } else {
            log.error({ url: req.url, res: res }, 'Headers have already been set after hitting middlewarae fallback');
        }
    });
};

/**
 * Configure Socket.io
 */
module.exports.configureSocketIO = function (app, db) {
    log.trace({ func: 'configureSocketIO' }, 'Initializing SocketIO');

    // Load the Socket.io configuration
    var server = require('./socket.io')(app, db);

    // Return server object
    return server;
};

module.exports.initHttps = function (app) {
    if (!!config.https.enabled && !!config.https.port) {
        // Log SSL usage
        log.debug(config.https, 'Initializing HTTPS Server Protocol');

        var options = {};

        if (!!config.https.privateKeyPath && fs.existsSync(config.https.privateKeyPath)) {
            log.debug('using private key at path: %s', config.https.privateKeyPath);
            options.key = fs.readFileSync(config.https.privateKeyPath, 'utf8');
        }
        if (!!config.https.publicKeyPath && fs.existsSync(config.https.publicKeyPath)) {
            log.debug('using public key at path: %s', config.https.publicKeyPath);
            options.cert = fs.readFileSync(config.https.publicKeyPath, 'utf8');
        }
        if (!!config.https.passphrase) {
            log.trace('... with a key passphrase');
            options.passphrase = config.https.passphrase;
        }

        log.debug(config.https, 'Initializing HTTPS Server Options');

        var httpsServer;
        try {
            // Create HTTPS Server
            httpsServer = https.createServer(options, app);
            log.info('HTTPS server successfully initialized');
        } catch (err) {
            log.error({ error: err }, 'HTTPS Initialization failed');
        }
        // Return HTTPS server instance
        return httpsServer;
    }

    log.trace({ func: 'initHttps' }, 'HTTPS is not Configured - Skipping');
};

/**
 * Initialize the Express application
 */
module.exports.init = function (db) {
    log.info({ func: 'init' }, 'Starting Initialization of Express Router');

    // Initialize express app
    var app = express();

    // Initialize local variables
    this.initLocalVariables(app);

    // Initialize Express middleware
    this.initMiddleware(app);

    // Initialize Express view engine
    this.initViewEngine(app);

    // Initialize Express session
    this.initSession(app, db);

    // Initialize Modules configuration
    this.initModulesConfiguration(app);

    // Initialize Helmet security headers
    this.initHelmetHeaders(app);

    // Initialize modules static client routes
    this.initModulesClientRoutes(app);

    // Initialize modules server authorization policies
    this.initModulesServerPolicies(app);

    // Initialize modules server routes
    this.initModulesServerRoutes(app);

    // Initialize error routes
    this.initErrorRoutes(app);

    // Create a new HTTP server
    var httpServer = http.createServer(app);

    // Configure Socket.io
    //httpServer = ?
    this.configureSocketIO(httpServer, db);

    var httpsServer = this.initHttps(app);
    if (httpsServer) {
        this.configureSocketIO(httpsServer, db);
    }

    log.info({ func: 'init' }, 'Completed Initialization of Express Router');

    return { http: httpServer, https: httpsServer };
};
