'use strict';

angular.module('users')
    .directive('osProfile', [
        function() {
            return {
                scope: {
                    profile: '=',
                    editMode: '=',
                },
                templateUrl: 'modules/users/views/templates/user-profile.client.template.html',
                restrict: 'E',
                replace: true,
                controller: 'OsProfileController',
                controllerAs: 'ctrl',
                //bindToController: true
            };
        }
    ])
    .controller('OsProfileController',
        function($scope) {
            debugger;
            console.log('[OPC] Profile: %o', this.profile);
            console.log('[OPC] editMode: %o', this.editMode);
            this.edit = function() {
                console.log('[OsProfileController] edit()');
                this.editMode.enabled = true;
            };

            this.cancel = function() {
                console.log('[OsProfileController] cancel()');
                this.editMode.enabled = false;
            };
        }
    );
