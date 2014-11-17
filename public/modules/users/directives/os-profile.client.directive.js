(function() {
    'use strict';

    angular.module('users')
        .directive('osProfile', [
            function() {
                return {
                    scope: {
                        title: '@?',
                        profile: '=',
                        editMode: '=?',
                        editFn: '&?',
                        cancelFn: '&?'
                    },
                    templateUrl: 'modules/users/views/templates/user-profile.client.template.html',
                    restrict: 'E',
                    replace: true,
                    controller: 'OsProfileController',
                    controllerAs: 'ctrl',
                    bindToController: true
                };
            }
        ])
        .controller('OsProfileController', ['$log',
            function($log) {
                this.editMode = this.editMode || {
                    enabled: false,
                    visible: false
                };

                this.edit = this.editFn || function() {
                    $log.debug('[OsProfileController] edit()');
                    this.editMode.enabled = true;
                };

                this.cancel = this.cancelFn || function() {
                    $log.debug('[OsProfileController] cancel()');
                    this.editMode.enabled = false;
                };
            }
        ])

    .directive('osProfileBadge', [
        function() {
            return {
                scope: {
                    profile: '='
                },
                templateUrl: 'modules/users/views/templates/user-badge.client.template.html',
                restrict: 'E',
                replace: true
            };
        }
    ]);
})();
