'use strict';

angular.module('users')
    .directive('osEditProfile', [
        function() {
            return {
                scope: {
                    profile: '=',
                    editMode: '='
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
    .controller('OsEditProfileController', ['Users', 'Addresses',
        function(Users, Address) {
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

            // Update a user profile
            // TODO: This is copied directly from Settings.client.controller
            this.updateUserProfile = function() {

                if (this.userForm.$valid) {
                    this.success = this.error = null;
                    var user = new Users(this.profile);

                    var _this = this;

                    user.$update(function(response) {
                        debugger;
                        _this.success = true;
                        _this.profile = response;
                        _this.editMode.enabled = false;
                    }, function(response) {
                        debugger;
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
                    streetAddresses: [''],
                });

                this.profile.addresses.push(addr);
            };
        }
    ]);
