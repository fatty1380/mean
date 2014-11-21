'use strict';

function DashboardController($scope, $rootScope, $location, $state, $route, $log, Auth) {

    if (Auth.user) {
        this.user = Auth.user;

        if (this.user.type === 'driver') {
            this.showProfile = true;
            this.showCompany = false;
        } else if (this.user.type === 'owner') {
            this.showProfile = false;
            this.showCompany = true;
        }

        this.showJobs = true;
        this.showApplications = true;
    }

    $scope.setModule = function(event, toState, toParams, fromState, fromParams) {
        $log.info('Routing dashboard from %s%s to %s%s based on event %o',
            fromState.parent ? fromState.parent + '.' : '',
            fromState.name,
            toState.parent ? toState.parent + '.' : '',
            toState.name,
            event);


        var stateName = toState.name;
        var parent = toState.parent || stateName.substring(0, stateName.indexOf('.'));

        switch (parent) {
            case 'user':
            case 'drivers':
            case 'profile':
                $scope.activeModule = 'users';
                break;
            case 'companies':
                $scope.activeModule = 'company';
                break;
            case 'jobs':
                $scope.activeModule = 'jobs';
                break;
            case 'applications':
                $scope.activeModule = 'applications';
                break;
            default:
                $scope.activeModule = null;
                break;
        }

        $log.debug('[Dashboard] Activated module \'%s\' for state [%s]', parent, stateName);
    };

    //$scope.setModule();

    $rootScope.$on('$stateChangeSuccess', $scope.setModule);
}

DashboardController.$inject = ['$scope', '$rootScope', '$location', '$state', '$route', '$log', 'Authentication'];

angular.module('dashboard')
    .controller('DashboardController', DashboardController);
