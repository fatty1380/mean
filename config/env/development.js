'use strict';

module.exports = {

    app: {
        title: 'Outset - Development Environment',
        useLocalhost: true
    },
    db: {
        uri: 'mongodb://ec2-54-148-79-252.us-west-2.compute.amazonaws.com/outset-dev',
        //uri: 'mongodb://localhost/outset-dev',
        options: {
            user: '',
            pass: ''
        }
    },
    logs: {
        access: process.env.LOG_ACCESS_PATH || './log/',
        stdout: {
            level: 'debug'
        }
    },
    https: {
        enabled: false, // process.env.ENABLE_HTTPS !== undefined ? process.env.ENABLE_HTTPS : true,
        port: 8443,
        privateKeyPath: './config/sslcerts/key.pem',
        publicKeyPath: './config/sslcerts/cert.pem',
        passphrase: 'password'
    },
    options: {
        debug: false,
        login: true,
        signup: true,
       showAuth: true
    },
    modules: {
        driver: {
            jobs : {
                list: true,
                view: true,
                create: true
            },
            applications : {
                list: true,
                view: true,
                create: true
            },
            company: {
                view: true
            }
        },
        owner: {
            jobs : {
                list: true,
                view: true,
                create: true
            },
            applications : {
                list: true,
                view: true,
                create: true
            },
            company : {
                create : true,
                edit: true
            }
        }
    },
    services: {
        everifile: {
            baseUrl: process.env.EVERIFILE_BASE_URL || 'https://renovo.everifile.com/renovo',
            username: process.env.EVERIFILE_USERNAME || 'api@joinoutset.com',
            password: process.env.EVERIFILE_PASS || 'fax7^kaY'
        },
        braintree: {
            environment: 'development',
            MerchantId: process.env.BRAINTREE_MERCHANT_ID || '9thy557h7r7t5x95',
            PublicKey: process.env.BRAINTREE_PUBLIC_KEY || 'sfnrsv2k6c78574s',
            PrivateKey: process.env.BRAINTREE_PRIVATE_KEY || '9da8cb7ae133c4021633f00e495fbf77',
            CSEKey: process.env.BRAINTREE_CSE_KEY || 'MIIBCgKCAQEAqC+6siLl5WXHc9aU1k+r/zzFdsrR+L+aAkp1wCMAb5IT+puvhbB+vYBx3oamublRks6TIWy3+P5hw4N94TN/ZUkR2gjcNxB4bIRdz+jcrQof6J7kOPk5zlakUwOXgMaY35we6lxr9VcLFwu609YWW0bLA+KuSTalG9UVuYiqnN2W9dlju7kIc2S4biRQVPvN73I769Qv+eDUU/EQGKZbFT5RilLCCLcH0SSo2LV7SKATLZBezDdmkvAsRwLDaUZhdAVjJfPOfQiYAXy5c0qQdodCw5MyHERI8yBrfEh4HsuLlNe6ihLt6NjQcYIrFyFlUP5KzUbkwvnwccUybSn7eQIDAQAB',
            promoCodes: true
            },
        google: {
        },
        s3: {
            enabled: false,
            s3Options: {
                bucket: 'outset-public-resources',
                accessKeyId: process.env.S3_ACCESS_KEY || 'AKIAIJ4QZKURJBV2DAWQ',
                secretAccessKey: process.env.S3_SECRET_KEY || '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'
            },
            folder: 'profiles-dev/'
        },
		mandrill: {
		},
        twilio: {
            accountSid: process.env.TWILIO_ACCOUNT_SID || 'AC51314159bbf230bc5769de5772ce8264',
            authToken: process.env.TWILIO_AUTH_TOKEN || '827a9998ea90ed5c0483cc4246ddcace',
            twilioNumber: process.env.TWILIO_NUMBER || '+18189601051',
            toOverride: '650-776-7675'
        }
    },
    mailer: {
        toOverride: 'pat@joinoutset.com',
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
