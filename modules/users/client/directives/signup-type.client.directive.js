(function () {
    'use strict';

    function SignupTypeCtrl($log, $q, $document) {
        var vm = this;

        vm.selectType = function(type) {
            $log.debug('[SignupType] User selected %s', type);
            vm.model = type;
            $document.scrollTopAnimated(0, 300);

            vm.callback();
        };
    }

    SignupTypeCtrl.$inject = ['$log', '$q', '$document'];

    function SignupTypeDirective() {
        return {
            templateUrl: '/modules/users/views/templates/signup-type.client.template.html',
            restrict: 'E',
            require: ['^form'],
            scope: {
                model: '=',
                callback: '&'
            },
            controller: 'SignupTypeController',
            controllerAs: 'vm',
            bindToController: true
        };
    }

    angular.module('users')
        .controller('SignupTypeController', SignupTypeCtrl)
        .directive('userSignupType', SignupTypeDirective);
})();
