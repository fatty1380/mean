module.exports = {
    app: {
        title: 'Outset',
        description: 'Driving Connections',
        keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
        runtimeMode: process.env.NODE_ENV
    },
    db: {
        uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/outset-dev',
        options: {
            user: '',
            pass: ''
        }
    },
    https: {
        enabled: false,
        port: 0,
        privateKeyPath: '',
        publicKeyPath: ''
    },
    options: {
        debug: false,
        login: false,
       signup: false ,
       showAuth: true,
       isTL: true
    },
    modules: {
        driver: {
            jobs : {
                list: false,
                view: false,
                create: false
            },
            applications : {
                list: false,
                view: false,
                create: false
            },
            company : {
                view: false
            }
        },
        owner: {
            jobs : {
                list: false,
                view: false,
                create: false
            },
            applications : {
                list: false,
                view: false,
                create: false
            },
            company : {
                create : false
            }
        }
    },
    logs: {
        access: process.env.LOG_ACCESS_PATH || './log/',
        stdout: {
            level: 'error'
        },
        streams: [{
            level: 'error',
            path: (process.env.LOG_ACCESS_PATH || './log/') + 'error.log'
        }]
    },
	mailer: {
        toOverride: false,
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	},
    services: {
        stubs: {
            userId: '562ab0cebd3222d851523755'  
        },
        appstore: {
            url: 'https://itunes.apple.com/us/app/truckerline-take-control-your/id1029130691?mt=8',
            badge: '<a href="https://itunes.apple.com/us/app/truckerline-take-control-your/id1029130691?mt=8" style="display:inline-block;overflow:hidden;background:url(http://linkmaker.itunes.apple.com/images/badges/en-us/badge_appstore-lrg.svg) no-repeat;width:165px;height:40px;"></a>'
        },
        everifile: {
            baseUrl: process.env.EVERIFILE_BASE_URL || 'https://renovo-api-test.everifile.com/renovo',
            username: process.env.EVERIFILE_USERNAME || 'api@dswheels.com',
            password: process.env.EVERIFILE_PASS || 'Test#123'
        },
        braintree: {
            MerchantId: process.env.BRAINTREE_MERCHANT_ID || '9thy557h7r7t5x95',
            PublicKey: process.env.BRAINTREE_PUBLIC_KEY || 'sfnrsv2k6c78574s',
            PrivateKey: process.env.BRAINTREE_PRIVATE_KEY || '9da8cb7ae133c4021633f00e495fbf77'
        },
        google: {},
        s3: {
            enabled: false,
            clientConfig: {
                maxAsyncS3: 20,
                s3RetryCount: 3,
                s3RetryDelay: 1000,
                multipartUploadThreshold: 20971520,
                multipartUploadSize: 15728640
            },
            s3Options: {
                bucket: 'outset-public-resources',
                accessKeyId: process.env.S3_ACCESS_KEY || 'your s3 key',
                secretAccessKey: process.env.S3_SECRET_KEY || 'your s3 secret'
            },
            folder: 'profiles-dev/'
        },
        fs: {
            writePath: './modules/users/client/img/profile/uploads/'
        },
        mandrill: {
            apiKey: 'v5XougHzBNv5yfbWE2WgcA'
        },
        twilio: {
            accountSid: 'AC15d6d12a6d92ca496a261fb4bba62956',
            authToken: '7ead479d89436da9933c34e7d90ac82f', 
            twilioNumber: '+15005550006'
        },
        branch: {
            url: 'https://api.branch.io',
            key: 'key_test_djoMGBQ5jCINia7eaPxrmocbtqjS2VLX',
            secret: 'secret_test_AWSPorraAdrOEyxfukw0DKT2icQFeHwe'
        },
        luceo: {
            coreMark: {
                baseUrl: 'https://ws-core-mark.luceosolutions.com/rest/',
                username: 'core-mark',
                password: 'eFEv6GFyN'
            }
        }
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'Cinderella story. Outta nowhere. A former greenskeeper, now, about to become the Masters champion. It looks like a mirac... Its in the hole! Its in the hole! Its in the hole!',
    sessionCollection: 'sessions',
    
    security: {
        enableSession: false,
        enableJWT: true,
        tokenLife: 1000 * 3600 * 24 * 30,
        cors: {
            whitelist: ['*']
        },
        randomB64: 'kvwBOcTj8kX3QpgdkqwVkQ=='
    },

    facebook: {
        clientID: process.env.FACEBOOK_ID || 'APP_ID',
        clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
        callbackURL: '/api/auth/facebook/callback'
    },
    twitter: {
        clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
        clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
        callbackURL: '/api/auth/twitter/callback'
    },
    google: {
        clientID: process.env.GOOGLE_ID || 'APP_ID',
        clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
        callbackURL: '/api/auth/google/callback'
    },
    linkedin: {
        clientID: process.env.LINKEDIN_ID || 'APP_ID',
        clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
        callbackURL: '/api/auth/linkedin/callback'
    },
    github: {
        clientID: process.env.GITHUB_ID || 'APP_ID',
        clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
        callbackURL: '/api/auth/github/callback'
    }
};

// TODO: Change sessionSecret to secure, random, value
