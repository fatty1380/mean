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
