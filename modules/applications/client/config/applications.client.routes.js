(function () {
    'use strict';


    function handle404s(err, $q) {
        debugger;
        // recover here if err is 404
        if (err.status === 404) {
            return null;
        } //returning recovery
        // otherwise return a $q.reject
        return $q.reject(err);
    }


    function config($stateProvider) {
        // Applications state routing
        $stateProvider.

            state('applications', {
                abstract: true,
                url: '/applications',
                template: '<div ui-view class="content-section"></div>',
                parent: 'fixed-opaque'
            }).

            state('applications.list', {
                url: '',
                templateUrl: 'modules/applications/views/list-applications.client.view.html'
            }).

            state('applications.mine', {
                url: '/me',
                templateUrl: 'modules/applications/views/list-applications.client.view.html',
                resolve: {
                    applications: function(Authentication, Applications) {
                        var applications = Applications.ByUser.query({
                            userId: Authentication.user._id,
                            userType: Authentication.user.type
                        }).$promise;

                        return applications.catch(handle404s);
                    }
                },
                controller: function(applications) {
                    var vm = this;
                    vm.applications = applications;
                },
                controllerAs: 'vm',
                bindToController: true
            }).

            state('applications.create', {
                url: '/create',
                templateUrl: 'modules/applications/views/create-application.client.view.html'
            }).

            state('applications.view', {
                url: '/:applicationId',
                templateUrl: 'modules/applications/views/view-application.client.view.html',
                resolve: {
                    application: function ($stateParams, Applications) {
                        var promise =  Applications.ById.get({
                            id: $stateParams.applicationId
                        }).$promise;

                        return promise.catch(handle404s);
                    }
                },
                controller: 'ApplicationMainController',
                controllerAs: 'vm',
                bindToController: true
            }).

            state('applications.edit', {
                url: '/:applicationId/edit',
                templateUrl: 'modules/applications/views/edit-application.client.view.html'
            });
    }

    config.$inject = ['$stateProvider'];

    angular.module('applications').config(config);
})();
