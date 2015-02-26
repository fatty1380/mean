'use strict';

module.exports = {
    client: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css',
                'public/lib/components-font-awesome/css/font-awesome.css',
                'public/lib/textAngular/src/textAngular.css',
                'public/lib/animate.css/animate.css',
                'public/lib/ngImgCrop/compile/unminified/ng-img-crop.css'
            ],
            js: [
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/angular-file-upload/angular-file-upload.js',
                'public/lib/autofill-event/src/autofill-event.js', /// Needed?
                'public/lib/ngmap/build/scripts/ng-map.js',
                'public/lib/lodash/dist/lodash.js',
                '//maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry', // TODO: use gmapApiProvider
                'public/lib/moment/min/moment-with-locales.js',
                'public/lib/angular-moment/angular-moment.js',
                'https://js.braintreegateway.com/v2/braintree.js',
                'public/lib/ngImgCrop/compile/unminified/ng-img-crop.js',
                'public/lib/angular-scroll/angular-scroll.js',
                '//cdn.raygun.io/raygun4js/raygun.min.js',
                'public/lib/tinymce/tinymce.js',
                'public/lib/angular-sanitize/angular-sanitize.js'
            ],
            tests: ['public/lib/angular-mocks/angular-mocks.js']
        },
        css: [
            'modules/*/client/css/*.css'
        ],
        less: [
            'modules/*/client/less/*.less'
        ],
        sass: [
            'modules/*/client/scss/*.scss'
        ],
        js: [
            'modules/core/client/app/config.js',
            'modules/core/client/app/init.js',
            'modules/*/client/*.js',
            'modules/*/client/**/*.js'
        ],
        views: ['modules/*/client/views/**/*.html']
    },
    server: {
        allJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
        models: 'modules/*/server/models/**/*.js',
        routes: ['modules/*[!core]/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
        sockets: 'modules/*/server/sockets/**/*.js',
        config: 'modules/*/server/config/*.js',
        policies: 'modules/*/server/policies/*.js',
        views: 'modules/*/server/views/*.html'
    }
};
