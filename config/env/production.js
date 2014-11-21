'use strict';

module.exports = {
<<<<<<< HEAD
    db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/outset',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
            ],
            js: [
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/angular-route/angular-route.min.js',
                'public/lib/textAngular/src/textAngular-sanitize.min.js',
                'public/lib/textAngular/src/textAngular.min.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    },
    facebook: {
        clientID: process.env.FACEBOOK_ID || 'APP_ID',
        clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
        callbackURL: '/auth/facebook/callback'
=======
    db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/mean',
    facebook: {
        clientID: process.env.FACEBOOK_ID || 'APP_ID',
        clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
        callbackURL: '/api/auth/facebook/callback'
>>>>>>> c94c870a306c87d46b003d5ae93a497dcc63b3bc
    },
    twitter: {
        clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
        clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
<<<<<<< HEAD
        callbackURL: '/auth/twitter/callback'
=======
        callbackURL: '/api/auth/twitter/callback'
>>>>>>> c94c870a306c87d46b003d5ae93a497dcc63b3bc
    },
    google: {
        clientID: process.env.GOOGLE_ID || 'APP_ID',
        clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
<<<<<<< HEAD
        callbackURL: '/auth/google/callback'
=======
        callbackURL: '/api/auth/google/callback'
>>>>>>> c94c870a306c87d46b003d5ae93a497dcc63b3bc
    },
    linkedin: {
        clientID: process.env.LINKEDIN_ID || 'APP_ID',
        clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
<<<<<<< HEAD
        callbackURL: '/auth/linkedin/callback'
=======
        callbackURL: '/api/auth/linkedin/callback'
>>>>>>> c94c870a306c87d46b003d5ae93a497dcc63b3bc
    },
    github: {
        clientID: process.env.GITHUB_ID || 'APP_ID',
        clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
<<<<<<< HEAD
        callbackURL: '/auth/github/callback'
=======
        callbackURL: '/api/auth/github/callback'
>>>>>>> c94c870a306c87d46b003d5ae93a497dcc63b3bc
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
<<<<<<< HEAD
};
=======
};
>>>>>>> c94c870a306c87d46b003d5ae93a497dcc63b3bc
