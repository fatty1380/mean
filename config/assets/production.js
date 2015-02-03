'use strict';

module.exports = {
    client: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                '//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css',
                'public/lib/textAngular/src/textAngular.css',
                'public/lib/animate.css/animate.min.css',
                'public/lib/ngImgCrop/compile/minified/ng-img-crop.css'
            ],
            js: [
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                'public/lib/angular-file-upload/angular-file-upload.min.js',
                'public/lib/textAngular/dist/textAngular-rangy.min.js',
                'public/lib/textAngular/dist/textAngular-sanitize.min.js',
                'public/lib/textAngular/dist/textAngular.min.js',
                'public/lib/ngmap/build/scripts/ng-map.min.js',
                'public/lib/lodash/dist/lodash.min.js',
                'public/lib/pdfjs-dist/build/pdf.combined.js',
                'public/lib/angular-pdf-viewer/dist/angular-pdf-viewer.min.js',
                '//maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry', // TODO: use gmapApiProvider
                'public/lib/moment/min/moment-with-locales.min.js',
                'public/lib/angular-moment/angular-moment.min.js',
                'https://js.braintreegateway.com/v2/braintree.js',
                'public/lib/ngImgCrop/compile/minified/ng-img-crop.js',
                'https://cdnjs.cloudflare.com/ajax/libs/angular-scroll/0.6.4/angular-scroll.min.js'
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    }
};
