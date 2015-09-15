'use strict';

module.exports = {
    client: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css',
                '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',
                'public/lib/animate.css/animate.css',
                'public/lib/ngImgCrop/compile/unminified/ng-img-crop.css',
                'public/lib/angular-toastr/dist/angular-toastr.css',
                'public/lib/ngSignaturePad/ngSignaturePad.css'
            ],
            js: [
                //'/socket.io/socket.io.js', // TODO: Determine if this is the correct way to inject this?
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-messages/angular-messages.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
                'public/lib/angular-file-upload/angular-file-upload.js',
                'public/lib/ng-file-upload/ng-file-upload.js',
                'public/lib/autofill-event/src/autofill-event.js', /// Needed?
                'public/lib/ngmap/build/scripts/ng-map.js',
                'public/lib/lodash/lodash.js',
                '//maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry', // TODO: use gmapApiProvider
                'public/lib/moment/min/moment-with-locales.js',
                'public/lib/angular-moment/angular-moment.js',
                'https://js.braintreegateway.com/v2/braintree.js',
                'public/lib/ngImgCrop/compile/unminified/ng-img-crop.js',
                'public/lib/angular-scroll/angular-scroll.js',
                'public/lib/raygun4js/dist/raygun.min.js',
                'public/lib/tinymce/tinymce.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-toastr/dist/angular-toastr.tpls.js',
                'public/lib/ngSignaturePad/ngSignaturePad.js',
                'public/lib/signature_pad/signature_pad.js',
                '//code.jquery.com/jquery-1.11.2.min.js' // TODO: Remove jQuery
            ],
            font: [
                '//fonts.googleapis.com/css?family=Open+Sans:300,400,700',
                '//fonts.googleapis.com/css?family=Roboto:400,300,700,900',
                '//fonts.googleapis.com/css?family=Lato:400,300,200'
            ],
            tests: ['public/lib/angular-mocks/angular-mocks.js']
        },
        css: [
            'modules/theme/client/css/styles.css'
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
        routes: ['modules/*!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
        sockets: 'modules/*/server/sockets/**/*.js',
        config: 'modules/*/server/config/*.js',
        policies: 'modules/*/server/policies/*.js',
        views: 'modules/*/server/views/*.html'
    }
};
