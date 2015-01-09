'use strict';

module.exports = {
    db: 'mongodb://ec2-54-148-79-252.us-west-2.compute.amazonaws.com/outset-dev',
	app: {
        title: 'Outset - Development Environment'
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
	},
    braintree: {
        MerchantId : process.env.BRAINTREE_MERCHANT_ID || '9thy557h7r7t5x95',
        PublicKey: process.env.BRAINTREE_PUBLIC_KEY || 'sfnrsv2k6c78574s',
        PrivateKey: process.env.BRAINTREE_PRIVATE_KEY || '9da8cb7ae133c4021633f00e495fbf77'
    }
};
