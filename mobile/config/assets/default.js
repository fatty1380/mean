'use strict';

module.exports = {
    mobile: {
        lib: {
            js: [
                'https://maps.googleapis.com/maps/api/js?key=AIzaSyDb2fSf75lhB2A0lBXeZ_89iXDhO-pmLoY&libraries=geometry,places',
                'lib/ionic/release/js/ionic.bundle.js',
                'lib/ionic-rating/ionic-rating.js',
                'lib/lodash/lodash.js',
                'lib/moment/min/moment.min.js',
                'lib/angular-elastic/elastic.js',
                'lib/angular-messages/angular-messages.js',
                'lib/angular-google-staticmaps/angular-google-staticmaps.js',
                'lib/ngCordova/dist/ng-cordova-mocks.js',
                'cordova.js',
                'lib/ng-cordova-oauth/src/utility.js',
                'lib/ng-cordova-oauth/src/oauth.facebook.js',
                'lib/pdfjs-dist/build/pdf.js',
                'lib/pdfjs-dist/build/pdf.worker.js'
            ]
        },
        js: [
            'modules/app/patch/webViewPatch.js',
            'modules/app/app.config.js',
            'modules/app/app.init.js',
            'modules/app/services/app.modal.service.js',
            'modules/app/services/app.user.service.js',
            'modules/app/services/app.requests.service.js',
            'modules/app/services/app.users.service.js',
            'modules/app/services/app.camera.service.js',
            'modules/app/services/app.contacts.service.js',
            'modules/app/services/app.utils.service.js',
            'modules/app/services/app.focus.service.js',
            'modules/app/services/app.timer.service.js',
            'modules/app/services/app.updates.service.js',
            'modules/app/services/app.security.service.js',
            'modules/app/services/app.api.service.js',
            'modules/app/services/app.superCache.service.js',
            'modules/app/services/app.cache.service.js',
            'modules/app/services/loading.service.js',
            'modules/app/filters/app.contacts.filter.js',
            'modules/app/filters/app.checked.filter.js',
            'modules/app/filters/app.monthDate.filter.js',
            'modules/app/filters/capitalize.filter.js',
            'modules/app/directives/add.contact.directive.js',
            'modules/app/directives/debounce.input.directive.js',
            'modules/app/directives/focus.input.directive.js',
            'modules/app/directives/focusMe.input.directive.js',
            'modules/app/directives/toggle.directive.js',
            'modules/app/constants/settings.js',
            'modules/avatar/avatar.module.js',
            'modules/avatar/services/avatar.service.js',
            'modules/avatar/controllers/image.crop.controller.js',
            'modules/signup/signup.modules.js',
            'modules/signup/config/signup.modules.routes.js',
            'modules/signup/controllers/home.controller.js',
            'modules/signup/controllers/login.controller.js',
            'modules/signup/controllers/license.controller.js',
            'modules/signup/controllers/register.controller.js',
            'modules/signup/controllers/signup.controller.js',
            'modules/signup/controllers/trailers.controller.js',
            'modules/signup/controllers/trucks.controller.js',
            'modules/signup/controllers/login.controller.js',
            'modules/signup/controllers/friends.controller.js',
            'modules/signup/controllers/add.contact.controller.js',
            'modules/signup/controllers/add.friend.manually.controller.js',
            'modules/signup/directives/compare-to.directive.js',
            'modules/signup/directives/accessible.form.directive.js',
            'modules/signup/directives/ng-img-crop.js',
            'modules/signup/services/register.service.js',
            'modules/signup/services/facebook.service.js',
            'modules/signup/services/trailers.service.js',
            'modules/signup/services/trucks.service.js',
            'modules/signup/services/welcome.service.js',
            'modules/signup/services/token.service.js',
            'modules/signup/services/storage.service.js',
            'modules/signup/services/interceptor.service.js',
            'modules/account/account.module.js',
            'modules/account/config/account.module.routes.js',
            'modules/account/controllers/account.controller.js',
            'modules/account/directives/address.directive.js',
            'modules/account/child_modules/profile/profile.module.js',
            'modules/account/child_modules/profile/controllers/profile.controller.js',
            'modules/account/child_modules/profile/controllers/profile.edit.controller.js',
            'modules/account/child_modules/profile/controllers/profile.edit.trucks.controller.js',
            'modules/account/child_modules/profile/controllers/profile.edit.trailers.controller.js',
            'modules/account/child_modules/profile/controllers/profile.friends.controller.js',
            'modules/account/child_modules/profile/controllers/profile.add.friends.controller.js',
            'modules/account/child_modules/profile/controllers/profile.friends.requests.controller.js',
            'modules/account/child_modules/profile/controllers/profile.friends.manual.controller.js',
            'modules/account/child_modules/profile/controllers/profile.request.review.controller.js',
            'modules/account/child_modules/profile/controllers/profile.add.experience.controller.js',
            'modules/account/child_modules/profile/controllers/profile.edit.experience.controller.js',
            'modules/account/child_modules/profile/controllers/profile.list.experience.controller.js',
            'modules/account/child_modules/profile/controllers/profile.edit.address.controller.js',
            'modules/account/child_modules/profile/directives/experienceList.directive.js',
            'modules/account/child_modules/profile/services/profileModals.service.js',
            'modules/account/child_modules/profile/services/review.service.js',
            'modules/account/child_modules/profile/services/experience.service.js',
            'modules/account/child_modules/profile/services/friends.service.js',
            'modules/account/child_modules/profile/services/badge.service.js',
            'modules/account/child_modules/company/company.module.js',
            'modules/account/child_modules/company/config/company.module.routes.js',
            'modules/account/child_modules/company/services/company.service.js',
            'modules/account/child_modules/company/controllers/company.controller.js',
            'modules/account/child_modules/company/controllers/job.controller.js',
            'modules/account/child_modules/company/services/company.modals.service.js',
            'modules/account/child_modules/company/directives/job-item.mobile.directive.js',
            'modules/account/child_modules/company/controllers/application.controller.js',
            'modules/account/child_modules/lockbox/lockbox.module.js',
            'modules/account/child_modules/lockbox/controllers/DocumentModal.controller.js',
            'modules/account/child_modules/lockbox/controllers/lockbox.controller.js',
            'modules/account/child_modules/lockbox/controllers/lockbox.create.controller.js',
            'modules/account/child_modules/lockbox/controllers/lockbox.share.controller.js',
            'modules/account/child_modules/lockbox/controllers/lockbox.order.reports.controller.js',
            'modules/account/child_modules/lockbox/controllers/lockbox.edit.controller.js',
            'modules/account/child_modules/lockbox/controllers/lockbox.share.contacts.controller.js',
            'modules/account/child_modules/lockbox/services/lockbox.documents.service.js',
            'modules/account/child_modules/lockbox/services/lockboxSecurity.service.js',
            'modules/account/child_modules/lockbox/services/lockbox.modals.service.js',
            'modules/account/child_modules/lockbox/directives/lockbox.pdfviewer.directive.js',
            'modules/account/child_modules/lockbox/directives/lockbox.imageviewer.directive.js',
            'modules/account/child_modules/lockbox/directives/lockbox.viewer.directive.js',
            'modules/account/child_modules/messages/messages.module.js',
            'modules/account/child_modules/messages/controllers/messages.controller.js',
            'modules/account/child_modules/messages/controllers/message.chat.details.controller.js',
            'modules/account/child_modules/messages/controllers/message.friend.controller.js',
            'modules/account/child_modules/messages/services/messages.service.js',
            'modules/account/child_modules/messages/services/messages.modals.service.js',
            'modules/account/child_modules/activity/activity.module.js',
            'modules/account/child_modules/activity/controllers/activity.controller.js',
            'modules/account/child_modules/activity/controllers/activity.add.controller.js',
            'modules/account/child_modules/activity/controllers/activity.details.controller.js',
            'modules/account/child_modules/activity/services/activity.service.js',
            'modules/account/child_modules/activity/services/activity.modals.service.js',
            'modules/account/child_modules/activity/directives/activity.iongoogleplace.directive.js',
            'modules/account/child_modules/activity/directives/feed-item.mobile.directive.js',
        ],
        fonts: [],
        css: [
            'assets/css/styles.css'
        ],
        less: [
            'modules/*/client/less/*.less'
        ],
        sass: [
            'modules/*/client/scss/*.scss'
        ],
        allJS: [
            'modules/**/*.js'
        ],
        views: ['modules/**/*.html']
    }
};