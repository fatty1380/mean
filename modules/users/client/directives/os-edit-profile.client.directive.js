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
                        cancelFn: '&'
                    },
                    //template: '<h1>HELLO!!!</h1>',
                    templateUrl: 'modules/users/views/templates/edit-settings.client.template.html',
                    restrict: 'E',
                    replace: true,
                    controller: 'OsEditProfileController',
                    controllerAs: 'ctrl',
                    bindToController: true
                };
            }
        ])
        .controller('OsEditProfileController', ['$log', 'Users', 'Addresses',
            function($log, Users, Address) {

                this.edit = this.editFn || function() {
                    $log.debug('[OsProfileController] edit()');
                    this.editMode.enabled = true;
                };

                this.cancel = this.cancelFn || function() {
                    $log.debug('[OsProfileController] cancel()');
                    this.editMode.enabled = false;
                };

                // Update a user profile
                // TODO: This is copied directly from Settings.client.controller
                this.updateUserProfile = function() {

                    if (this.userForm.$valid) {
                        this.success = this.error = null;
                        var user = new Users(this.profile);

                        var _this = this;

                        user.$update(function(response) {
                            _this.success = true;
                            _this.profile = response;
                            _this.editMode.enabled = false;
                        }, function(response) {
                            _this.error = response.data.message;
                        });
                    } else {
                        this.submitted = true;
                    }
                };

                this.addAddress = function() {
                    // Prevent this from bubbling up;
                    event.preventDefault();

                    var addr = new Address({
                        type: 'select type',
                        streetAddresses: ['', ''],
                    });

                    this.profile.addresses.push(addr);
                };
            }
        ]);
})();
