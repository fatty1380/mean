'use strict';

module.exports = {
    client: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                'public/lib/components-font-awesome/css/font-awesome.min.css',
                'public/lib/textAngular/src/textAngular.min.css',
            ],
            js: [
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/angular-file-upload/angular-file-upload.min.js',
                'public/lib/angular-route/angular-route.min.js',
                'public/lib/textAngular/src/textAngular-sanitize.min.js',
                'public/lib/textAngular/src/textAngular.min.js',
                'public/lib/angular-google-maps/dist/angular-google-maps.min.js',
                'public/lib/lodash/dist/lodash.min.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    }
};
