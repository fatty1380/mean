(function() {
    'use strict';


    function JobItemController(Auth) {
        var dm = this;

        dm.auth = Auth;
        dm.displayMode = 'all';

        dm.showSection = function (section, only) {
            if (!only && dm.displayMode === 'all') {
                return true;
            }

            return dm.displayMode === section;
        };

        dm.setDisplay = function (section) {
            dm.displayMode = section || 'all';
        };
    }

    function JobDirective() {
        return {
            scope: {
                job: '=',
                inline: '=?',
                editSref: '@?',
                showEdit: '=?'
            },
            templateUrl: '/modules/jobs/views/templates/job.client.template.html',
            restrict: 'E',
            replace: true,
            controller: JobItemController,
            controllerAs: 'dm',
            bindToController: true
        };
    }

    JobItemController.$inject = ['Authentication'];

    angular.module('jobs')
        .directive('osJob', JobDirective);

})();
