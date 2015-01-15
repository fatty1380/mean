(function() {
    'use strict';

    /**
    * @ngdoc directive
    * @name core.directive:osProfile
    * @element os-profile
    * @restrict E
    * --------------------
    * @description
    * Used to display a User Profile, including Company or Driver profile information
*
* @property {User} profile  the user profile to be displayed @required
* @property {String} title  An optional cusom title to display at the top
* @property {Bool} editable  Whether or not the profile can be edited by the current user
* @property {Funtion} editFn  A function to be called when the user cliks the edit link.
    */

    angular.module('users')
        .directive('osProfile', [
            function() {
                return {
                    scope: {
                        profile: '=',
                        title: '@?',
                        editable: '=?',
                        editFn: '&?'
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
                this.edit = this.editFn;
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
