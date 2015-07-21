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
	services: {
		everifile: { // Using 'PRODUCTION' instance for now
			baseUrl: process.env.EVERIFILE_BASE_URL || 'https://renovo.everifile.com/renovo',
			username: process.env.EVERIFILE_USERNAME || 'api@joinoutset.com',
			password: process.env.EVERIFILE_PASS || 'fax7^kaY'
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
		}
	},
    logs: {
        access: '', //åprocess.env.LOG_ACCESS_PATH || './log/',
        stdout: {
            level: 'debug'
        }
    }
};
