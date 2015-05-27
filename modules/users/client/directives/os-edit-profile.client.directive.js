(function() {
    'use strict';

    angular.module('users')
        .directive('osEditProfile', [
            function() {
                return {
                    scope: {
                        profile: '=model',
                        editFn: '&',
                        cancelFn: '&',
                        updateFn: '&'
                    },
                    templateUrl: '/modules/users/views/templates/edit-settings.client.template.html',
                    restrict: 'E',
                    replace: true,
                    controller: 'EditProfileController',
                    controllerAs: 'vm',
                    bindToController: true
                };
            }
        ]);
})();
