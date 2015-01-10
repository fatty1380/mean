(function() {
    'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

    function () {
        // Define a set of default roles
        this.defaultRoles = ['*'];
        this.defaultUserTypes = ['*'];

        // Define the menus object
        this.menus = {};

        // A private function for rendering decision
        var shouldRender = function (user) {
            if (user) {
                var roleValid = !!~this.roles.indexOf('*');
                var typeValid = !!~this.userTypes.indexOf('*');

                if (!roleValid) {
                    roleValid = validateRole(user.roles, this.roles);
                }

                // Validate Type, only if the role is valid
                if (roleValid && !typeValid) {
                    typeValid = validateType(user.type, this.userTypes);
                }

                return (roleValid && typeValid);

            } else {
                return this.isPublic;
            }

            return false;
        };

        function validateRole(userRoles, validRoles) {
            for (var userRoleIndex in userRoles) {
                if (userRoles.hasOwnProperty(userRoleIndex)) {
                    for (var roleIndex in validRoles) {
                        if (validRoles.hasOwnProperty(roleIndex)) {
                            if (validRoles[roleIndex] === userRoles[userRoleIndex]) {
                                return true;
                            }
                            if (validRoles[roleIndex] === '*') {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        }

        function validateType(userType, validTypes) {
            for (var typeIndex in validTypes) {
                if (validTypes.hasOwnProperty(typeIndex)) {
                    if (validTypes[typeIndex] === userType) {
                        return true;
                    }
                    if (validTypes[typeIndex] === '*') {
                        return true;
                    }
                }
            }

            return false;
        }

        // Validate menu existance
        this.validateMenuExistance = function (menuId) {
            if (menuId && menuId.length) {
                if (this.menus[menuId]) {
                    return true;
                } else {
                    throw new Error('Menu does not exists');
                }
            } else {
                throw new Error('MenuId was not provided');
            }

            return false;
        };

        // Get the menu object by menu id
        this.getMenu = function (menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            return this.menus[menuId];
        };

        // Add new menu object by menu id
        this.addMenu = function (menuId, options) {
            options = options || {};

            // Create the new menu
            this.menus[menuId] = {
                isPublic: ((options.isPublic === null || typeof options.isPublic === 'undefined') ? true : options.isPublic),
                roles: options.roles || this.defaultRoles,
                userTypes: options.userTypes || this.defaultUserTypes,
                items: options.items || [],
                shouldRender: shouldRender
            };

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenu = function (menuId) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Return the menu object
            delete this.menus[menuId];
        };

        // Add menu item object
        this.addMenuItem = function (menuId, options) {
            options = options || {};

            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            var menuItemDefault = {
                title: '',
                state: '',
                type: 'item',
                class: undefined,
                isPublic: this.menus[menuId].isPublic,
                roles: this.menus[menuId].roles,
                userTypes: this.menus[menuId].userTypes,
                position: 100,
                items: [],
                shouldRender: shouldRender
            };

            // Push new menu item
            var newItem = angular.extend(menuItemDefault, options);
            this.menus[menuId].items.push(newItem);

            // Add submenu items
            if (options.items) {
                for (var i in options.items) {
                    if (options.items.hasOwnProperty(i)) {
                        this.addSubMenuItem(menuId, options.link, options.items[i]);
                    }
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Add submenu item object
        this.addSubMenuItem = function (menuId, parentItemState, options) {
            options = options || {};

            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            var menuSubItemDefault = {
                title: '',
                state: '',
                position: 0,
                shouldRender: shouldRender
            };

            // Search for menu item
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].state === parentItemState) {
                    menuSubItemDefault = angular.extend(menuSubItemDefault, {
                        isPublic: this.menus[menuId].items[itemIndex].isPublic,
                        roles: this.menus[menuId].items[itemIndex].roles,
                        userTypes: this.menus[menuId].items[itemIndex].userTypes
                    });
                    // Push new submenu item
                    var newSubMenuItem = angular.extend(menuSubItemDefault, options);
                    this.menus[menuId].items[itemIndex].items.push(newSubMenuItem);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeMenuItem = function (menuId, menuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            // Search for menu item to remove
            for (var itemIndex in this.menus[menuId].items) {
                if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
                    this.menus[menuId].items.splice(itemIndex, 1);
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        // Remove existing menu object by menu id
        this.removeSubMenuItem = function (menuId, submenuItemURL) {
            // Validate that the menu exists
            this.validateMenuExistance(menuId);

            var menuItems;

            // Search for menu item to remove
            for (var itemIndex in (menuItems = this.menus[menuId].items)) {
                if (menuItems.hasOwnProperty(itemIndex)) {
                    for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
                        if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
                            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
                        }
                    }
                }
            }

            // Return the menu object
            return this.menus[menuId];
        };

        //Adding the topbar menu
        this.addMenu('topbar', {
            isPublic: false
        });

        this.addMenu('adminbar', {
            isPublic: false,
            roles: ['admin']
        });
    }

])
;


})();
