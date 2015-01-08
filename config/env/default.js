module.exports = {
    app: {
        title: 'outset',
        description: 'Driving Connections',
        keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
        googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID',
        runtimeMode: process.env.NODE_ENV
    },
    logs: {
        access: process.env.LOG_ACCESS_PATH || '/var/log/nodejs/'
    },
    services: {
        everifile: {
            baseUrl : process.env.EVERIFILE_BASE_URL || 'https://renovo.everifile.com/renovo',
            username : process.env.EVERIFILE_USERNAME || 'api@joinoutset.com',
            password : process.env.EVERIFILE_PASS || 'fax7^kaY'
        }
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'MEAN',
    sessionCollection: 'sessions'
};

// TODO: Change sessionSecret to secure, random, value
