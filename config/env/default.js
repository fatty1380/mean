module.exports = {
    app: {
        title: 'Outset',
        description: 'Driving Connections',
        keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
        runtimeMode: process.env.NODE_ENV
    },
    logs: {
        access: process.env.LOG_ACCESS_PATH || '/var/log/nodejs/'
    },
    services: {
        everifile: {
            baseUrl : process.env.EVERIFILE_BASE_URL || 'https://renovo-api-test.everifile.com/renovo',
            username : process.env.EVERIFILE_USERNAME || 'api@dswheels.com',
            password : process.env.EVERIFILE_PASS || 'Test#123'
        },
        braintree: {
            MerchantId : process.env.BRAINTREE_MERCHANT_ID || '9thy557h7r7t5x95',
            PublicKey: process.env.BRAINTREE_PUBLIC_KEY || 'sfnrsv2k6c78574s',
            PrivateKey: process.env.BRAINTREE_PRIVATE_KEY || '9da8cb7ae133c4021633f00e495fbf77'
        },
        google: {

        }
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'Cinderella story. Outta nowhere. A former greenskeeper, now, about to become the Masters champion. It looks like a mirac... Its in the hole! Its in the hole! Its in the hole!',
    sessionCollection: 'sessions'
};

// TODO: Change sessionSecret to secure, random, value
