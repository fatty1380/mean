(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .constant('modalTemplates', {
            lockboxShare: {
                template: 'modules/account/child_modules/lockbox/templates/lockbox-share.html',
                service: 'lockboxShareService'
            },
            lockboxEdit: {
                template: 'modules/account/child_modules/lockbox/templates/lockbox-edit.html',
                service: 'lockboxEditService'
            },
            profileEdit: {
                template: 'modules/account/child_modules/profile/templates/profile-edit.html',
                service: 'profileEditService'
            },
            profileShare: {
                template: 'modules/account/child_modules/profile/templates/profile-share.html',
                service: 'profileShareService'
            },
            profileRequest: {
                template: 'modules/account/child_modules/profile/templates/profile-request.html',
                service: 'profileRequestService'
            }
        });
})();
