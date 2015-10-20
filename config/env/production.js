'use strict';

console.log('env.production: LAP: %s', process.env.LOG_ACCESS_PATH);
console.log('env.production: BTREE: %s', process.env.BRAINTREE_MERCHANT_ID);

module.exports = {
    db: {
        uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'ec2-54-148-79-252.us-west-2.compute.amazonaws.com') + (process.env.MONGO_DB_NAME || '/outset'),
        options: {
            user: '',
            pass: ''
        }
    },
    app: {
        title: process.env.PAGE_TITLE || 'Outset - The best way to find and fill transportation jobs',
        keywords: process.env.KEYWORDS || 'transportation, job, hiring, marketplace, outset, trucking, taxi, uber, lyft, livery, delivery, reputation'
    },
    https: {
        enabled: process.env.ENABLE_HTTPS !== undefined ? (process.env.ENABLE_HTTPS === 'true') : true,
        port: 443,
        privateKeyPath: process.env.PRIVATE_KEY_PATH || './config/sslcerts/key.pem',
        publicKeyPath: process.env.PUBLIC_KEY_PATH || './config/sslcerts/cert.pem',
        passphrase: null
    },
    options: {
        debug: false,
        login: true,
        signup: true,
        showAuth: false,
        isTL: process.env.IS_TRUCKERLINE !== undefined ? (process.env.IS_TRUCKERLINE === 'true') : true
    },
    modules: {
        driver: {
            jobs: {
                list: true,
                view: true,
                create: true
            },
            applications: {
                list: true,
                view: true,
                create: true
            },
            company: {
                view: true
            }
        },
        owner: {
            jobs: {
                list: true,
                view: true,
                create: true
            },
            applications: {
                list: true,
                view: true,
                create: true
            },
            company: {
                create: true,
                edit: true
            }
        }
    },
    logs: {
        access: process.env.LOG_ACCESS_PATH || '/var/log/nodejs/',
        stdout: {
            level: 'debug'
        },
        streams: [
            {
                type: 'rotating-file',
                level: 'error',
                path: (process.env.LOG_ACCESS_PATH || '/var/log/nodejs/') + 'outset-error.log',
                period: '1d',
                keep: 90
            }, {
                type: 'rotating-file',
                level: 'debug',
                path: (process.env.LOG_ACCESS_PATH || '/var/log/nodejs/') + 'outset-debug.log',
                period: '6h',
                keep: 28
            }
        ]
    },
    services: {
        everifile: {
            baseUrl: process.env.EVERIFILE_BASE_URL || 'https://renovo.everifile.com/renovo',
            username: process.env.EVERIFILE_USERNAME || 'api@joinoutset.com',
            password: process.env.EVERIFILE_PASS || 'fax7^kaY'
        },
        braintree: {
            environment: 'production',
            MerchantId: process.env.BRAINTREE_MERCHANT_ID || '6j7bz2twxmx9rj7t',
            PublicKey: process.env.BRAINTREE_PUBLIC_KEY || 'xqrh68985wmfk4vt',
            PrivateKey: process.env.BRAINTREE_PRIVATE_KEY || '3169dd9c4ea4dfb51e1ef43203620307',
            CSEKey: process.env.BRAINTREE_CSE_KEY || 'MIIBCgKCAQEAqg9Cl9ZeRFqEEfjOHUrNQmz4b4W4hSPoVy55yG5BMaOVI2K+tpWyERW3QSNZ85hr4OTq8j3ywWdXEKpkjChQP01zsrfM6Iz+wsiLUgUVbjJAx2hCTUMvAJkYGgUVXD6ViO0NG0mMGMWtcL7sz1F0hY3GnRX9TbBAYh4Rvd/uRZwlHCpHWLHmVhwzglbMxQYi9U3XRlKqRv/GVaupveuNQ4zCX32QBrv2FiBp3ICkpgfABAU7kSRV/91g+jDlSa2phJsYVbUJ3A/JcE8Uw2QJlhmd0HwmSeGTAW5VNDO+0lxrnIwE+KyWDX26U9/PhXLMlYaPvQzsxt1BoYK+YmduQwIDAQAB',
            promoCodes: true
        },
        google: {
            analyticsTrackingID: process.env.DISABLE_GA ? null : process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'UA-52626400-1'
        },
        s3: {
            enabled: true,
            s3Options: {
                bucket: process.env.S3_DEFAULT_BUCKET || 'outset-public-resources',
                accessKeyId: process.env.S3_ACCESS_KEY || 'AKIAIJ4QZKURJBV2DAWQ',
                secretAccessKey: process.env.S3_SECRET_KEY || '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'
            },
            folder: 'profiles'
        },
        fs: {
            writePath: '/tmp/'
        },
        mandrill: {
            apiKey: process.env.MANDRILL_API_KEY || 'yzS2d5_09Nh51me_QXI_zA'
        },
        twilio: {
            accountSid: process.env.TWILIO_ACCOUNT_SID || 'AC51314159bbf230bc5769de5772ce8264',
            authToken: process.env.TWILIO_AUTH_TOKEN || '827a9998ea90ed5c0483cc4246ddcace',
            twilioNumber: process.env.TWILIO_NUMBER || '+18189601051',
            toOverride: '650-776-7675'
        }
    },
    reports: {},
    mailer: {
        toOverride: process.env.MAILER_OVERRIDE || false,
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
