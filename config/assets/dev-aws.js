'use strict';

module.exports = {
	// Development assets
    client: {
        lib: {
            css: [
                '//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css',
                '//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css',
                '//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css',
                '//raw.githubusercontent.com/fraywing/textAngular/master/src/textAngular.css',
                '//cdnjs.cloudflare.com/ajax/libs/animate.css/3.2.0/animate.min.css',
                '//raw.githubusercontent.com/alexk111/ngImgCrop/master/compile/minified/ng-img-crop.css'
            ],
            js: [
                '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.8/angular.min.js',
                '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.8/angular-resource.min.js',
                '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.8/angular-animate.min.js',
                '//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.13/angular-ui-router.min.js',
                '//cdnjs.cloudflare.com/ajax/libs/angular-ui-utils/0.1.1/angular-ui-utils.min.js',
                '//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.0/ui-bootstrap-tpls.min.js',
                '//cdnjs.cloudflare.com/ajax/libs/angular-file-upload/0.5.6/angular-file-upload.min.js',
                '//raw.githubusercontent.com/tbosch/autofill-event/gh-pages/src/autofill-event.js',
                '//cdnjs.cloudflare.com/ajax/libs/textAngular/1.2.2/textAngular.min.js',
                '//cdnjs.cloudflare.com/ajax/libs/textAngular/1.2.2/textAngular-sanitize.min.js',
                '//rawgit.com/allenhwkim/angularjs-google-maps/master/build/scripts/ng-map.min.js',
                '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js',
                '//github.com/mozilla/pdfjs-dist/raw/master/build/pdf.combined.js',
                '//github.com/winkerVSbecks/angular-pdf-viewer/raw/master/dist/angular-pdf-viewer.min.js',
                '//maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry', // TODO: use gmapApiProvider
                '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment-with-locales.min.js',
                'https://js.braintreegateway.com/v2/braintree.js',
                '//raw.githubusercontent.com/alexk111/ngImgCrop/master/compile/minified/ng-img-crop.js'
            ]
        }
    }
};
