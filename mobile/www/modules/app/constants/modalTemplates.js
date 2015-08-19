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
            activityAdd: {
                template: 'modules/account/child_modules/activity/templates/activity-add.html',
                service: 'activityAddService'
            },
            activityDetails: {
                template: 'modules/account/child_modules/activity/templates/activity-details.html',
                service: 'activityDetailsService'
            },
            avatarEdit: {
                template: 'modules/signup/templates/edit-avatar.html',
                service: 'profileAvatarService'
            }
        });
})();
