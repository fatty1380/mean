(function() {
    'use strict';

    function ViewApplicationDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/applications/views/templates/os-view-application.client.template.html',
            restrict: 'E',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal'
                application: '=model'
            },
            controller: function () {
                var vm = this;
                debugger;
                vm.displayMode = vm.displayMode || 'normal';
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('applications').directive('osViewApplication', ViewApplicationDirective);

})();
