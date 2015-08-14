(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .constant('modalTemplates', {
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
            },
            addFriends: {
                template: 'modules/account/child_modules/profile/templates/profile-friends-add.html',
                service: 'addFriendsService'
            }
        });
})();
