(function() {
    'use strict';

    angular.module('users')
        .directive('osEditProfile', [
            function() {
                return {
                    scope: {
                        profile: '=',
                        editMode: '=',
                        editFn: '&',
                        cancelFn: '&',
                        updateFn: '&'
                    },
                    //template: '<h1>HELLO!!!</h1>',
                    templateUrl: 'modules/users/views/templates/edit-settings.client.template.html',
                    restrict: 'E',
                    replace: true,
                    controller: 'EditProfileController',
                    controllerAs: 'ctrl',
                    bindToController: true
                };
            }
        ]);
})();
