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
            }
        });
})();
