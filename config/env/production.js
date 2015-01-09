'use strict';

console.log('env.production: LAP: %s', process.env.LOG_ACCESS_PATH);
console.log('env.production: BTREE: %s', process.env.BRAINTREE_MERCHANT_ID);

module.exports = {
    db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/outset',
    app: {
        title: process.env.PAGE_TITLE || 'Outset - The best way to find and fill transportation jobs',
        keywords: process.env.KEYWORDS || 'transportation, job, hiring, marketplace, outset, trucking, taxi, uber, lyft, livery, delivery, reputation'
    },
    logs: {
        access: process.env.LOG_ACCESS_PATH || '/var/log/nodejs/'
    },
    services: {
        everifile: {
            baseUrl : process.env.EVERIFILE_BASE_URL || 'https://renovo.everifile.com/renovo',
            username : process.env.EVERIFILE_USERNAME || 'api@joinoutset.com',
            password : process.env.EVERIFILE_PASS || 'fax7^kaY'
        },
        braintree: {
            MerchantId : process.env.BRAINTREE_MERCHANT_ID,
            PublicKey: process.env.BRAINTREE_PUBLIC_KEY,
            PrivateKey: process.env.BRAINTREE_PRIVATE_KEY
        },
        google: {
            analyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'UA-52626400-1'
        }
    },
    mailer: {
        from: process.env.MAILER_FROM || 'MAILER_FROM',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
                pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
            }
        }
    }
};
