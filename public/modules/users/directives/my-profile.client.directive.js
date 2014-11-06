'use strict';

angular.module('users').directive('osProfile', [
    function() {
        return {
        	scope: {
        		profile: '=',
        		editMode: '='
        	},
        	//template: '<h1>HELLO!!!</h1>',
            templateUrl: 'modules/users/views/templates/user-profile.client.template.html',
            restrict: 'E',
            replace: true
        };
    }
]);
