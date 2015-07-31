(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .constant('modalTemplates', {
            lockboxShare: {
                template: 'modules/account/child_modules/lockbox/templates/lockbox-share.html',
                service: 'lockboxShareService'
            },
            lockboxShareRecipient: {
                template: 'modules/account/child_modules/lockbox/templates/lockbox-share-recipient.html',
                service: 'lockboxShareRecipientService'
            }
        });
})();
