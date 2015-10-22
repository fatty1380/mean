'use strict';

module.exports = {
    client: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css', // TODO: Watch for version number on upgrade
                'public/lib/animate.css/animate.min.css',
                'public/lib/ngImgCrop/compile/minified/ng-img-crop.css',
                'public/lib/angular-toastr/dist/angular-toastr.min.css',
                'public/lib/ngSignaturePad/ngSignaturePad.css'
            ],
            js: [
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-messages/angular-messages.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-router-tabs/src/ui-router-tabs.js',
                'public/lib/angular-ui-mask/dist/mask.min.js',
                'public/lib/angular-ui-bootstrap-bower/ui-bootstrap-tpls.min.js',
                'public/lib/angular-file-upload/angular-file-upload.min.js',
                'public/lib/ng-file-upload/ng-file-upload.min.js',
                'public/lib/ngmap/build/scripts/ng-map.min.js',
                'public/lib/lodash/lodash.min.js',
                '//maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry', // TODO: use gmapApiProvider?
                'public/lib/moment/min/moment-with-locales.min.js',
                'public/lib/angular-moment/angular-moment.min.js',
                'https://js.braintreegateway.com/v2/braintree.js',
                'public/lib/ngImgCrop/compile/minified/ng-img-crop.js',
                'https://cdnjs.cloudflare.com/ajax/libs/angular-scroll/0.6.4/angular-scroll.min.js',
                '//cdn.raygun.io/raygun4js/raygun.min.js',
                '//tinymce.cachefly.net/4.1/tinymce.min.js',
                'public/lib/angular-sanitize/angular-sanitize.min.js',
                'public/lib/angular-toastr/dist/angular-toastr.tpls.min.js',
                'public/lib/ngSignaturePad/ngSignaturePad.js',
                'public/lib/signature_pad/signature_pad.min.js',
                '//code.jquery.com/jquery-1.11.2.min.js' // TODO: Remove jQuery
            ]
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    }
};
