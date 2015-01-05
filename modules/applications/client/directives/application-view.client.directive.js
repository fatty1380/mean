(function () {
    'use strict';

    function ViewApplicationDirective() {
        var ddo;
        ddo = {
            templateUrl: 'modules/applications/views/templates/os-view-application.client.template.html',
            restrict: 'E',
            scope: {
                displayMode: '@?', // 'minimal', 'inline', 'table', 'normal', 'mine'
                application: '=?model',
                job: '=?',
                user: '=?'
            },
            controller: function (Applications, $log) {
                var vm = this;
                vm.displayMode = vm.displayMode || 'normal';

                if (vm.application) {
                    $log.debug('[ViewApplicationDirective] Displaying as %s: %o', vm.displayMode, vm.application);
                } else if (vm.job && vm.user) {
                    var p = Applications.ForDriver.get({jobId: vm.job._id, userId: vm.user._id}).$promise;

                    p.then(function (success) {
                        vm.application = success;

                        vm.lastMessage = vm.application.messages[0];
                    }, function (failure) {
                        $log.error('Unable to lookup application based on job and user: %o', failure);
                        debugger;
                    });

                }
            },
            controllerAs: 'vm',
            bindToController: true
        };

        return ddo;
    }

    angular.module('applications')
        .directive('osViewApplication', ViewApplicationDirective);

})();
