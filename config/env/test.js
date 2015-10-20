'use strict';

module.exports = {
	db: {
		uri: 'mongodb://localhost/outset-test',
		options: {
			user: '',
			pass: ''
		}
	},
	port: 3333,
	app: {
		title: 'outset - Test Environment'
	},
	mailer: {
        toOverride: 'pat+override@joinoutset.com'
	},
	services: {
		everifile: { // Using 'PRODUCTION' instance for now
			baseUrl: process.env.EVERIFILE_BASE_URL || 'https://renovo.everifile.com/renovo',
			username: process.env.EVERIFILE_USERNAME || 'api@joinoutset.com',
			password: process.env.EVERIFILE_PASS || 'fax7^kaY'
			// baseUrl: process.env.EVERIFILE_BASE_URL || 'https://renovo-api-test.everifile.com/renovo',
			// username: process.env.EVERIFILE_USERNAME || 'api@dswheels.com',
			// password: process.env.EVERIFILE_PASS || 'Test#123'
		},
		braintree: {
			MerchantId: process.env.BRAINTREE_MERCHANT_ID || '9thy557h7r7t5x95',
			PublicKey: process.env.BRAINTREE_PUBLIC_KEY || 'sfnrsv2k6c78574s',
			PrivateKey: process.env.BRAINTREE_PRIVATE_KEY || '9da8cb7ae133c4021633f00e495fbf77'
		},
		google: {},
		s3: {
			enabled: true,
			s3Options: {
				bucket: 'outset-test',
				accessKeyId: process.env.S3_ACCESS_KEY || 'AKIAIJ4QZKURJBV2DAWQ',
				secretAccessKey: process.env.S3_SECRET_KEY || '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'
			},
			folder: 'test-resources'
		},
		fs: {
			writePath: './modules/users/client/img/profile/uploads/'
		},
		mandrill: {
			apiKey: 'v5XougHzBNv5yfbWE2WgcA' //Truckerline TEST Key
		}
	},
    security: {
        enableSession: true,
        enableJWT: false,
        tokenLife: 1000 * 3600 * 24 * 30
    },
    logs: {
        access: '', //process.env.LOG_ACCESS_PATH || './log/',
        stdout: {
            level: 'debug',
        }
    }
};
