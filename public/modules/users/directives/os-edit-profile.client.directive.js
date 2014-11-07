'use strict';

angular.module('users').directive('osEditProfile', [
    function() {
        return {
        	scope: {
        		profile: '=',
        		editMode: '=',
                cancel: '&'
        	},
        	//template: '<h1>HELLO!!!</h1>',
            templateUrl: 'modules/users/views/templates/edit-settings.client.template.html',
            restrict: 'E',
            replace: true,
            controller: 'SettingsController',
            controllerAs: 'ctrl'
        };
    }
]);
