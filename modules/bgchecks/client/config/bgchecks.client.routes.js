(function () {
    'use strict';

    function ReportListController(reports, $stateParams) {
        var vm = this;

        vm.skus = $stateParams.sku;

        vm.reports = reports;
debugger;

    }

    function ResolveFields(Reports, $stateParams) {
        var skus = $stateParams.sku;

        debugger;

        return Reports.Fields.query({reportSku: skus}).$promise;
    }

    function resolveReports(Reports, $stateParams) {
        debugger;
        var skus = $stateParams.sku;
        return Reports.Types.list().$promise;
    }

    function BgCheckRoutes($stateProvider) {
        // Bgchecks state routing
        $stateProvider.
            state('listBgchecks', {
                url: '/bgchecks',
                templateUrl: 'modules/bgchecks/views/list-bgchecks.client.view.html'
            }).
            state('createBgcheck', {
                url: '/bgchecks/create',
                templateUrl: 'modules/bgchecks/views/create-bgcheck.client.view.html'
            }).
            state('viewBgcheck', {
                url: '/bgchecks/:bgcheckId',
                templateUrl: 'modules/bgchecks/views/view-bgcheck.client.view.html'
            }).
            state('editBgcheck', {
                url: '/bgchecks/:bgcheckId/edit',
                templateUrl: 'modules/bgchecks/views/edit-bgcheck.client.view.html'
            }).
            state('reviewReports', {
                url: '/reports/:sku',
                templateUrl: 'modules/bgchecks/views/review-reports.client.view.html',
                parent: 'headline-bg',
                controller: 'ReportListController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    reports: resolveReports
                }
            }).
            state('orderReports', {
                url: '/reports/:sku/order',
                template: '<br><br><h1 class="text-center center-block" style="position: relative;">Order your {{vm.sku || vm.skus}} report today!</h1><p ng-repeat="report in vm.reports"><b>{{report.name}}</b>: {{report.description}}</p>',
                parent: 'fixed-opaque',
                controller: 'ReportListController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    reports: ResolveFields
                },
                params: {sku: {
                    default: null,
                    isArray: true
                }}
            }).
            state('bgreportview', {
                url: '/bgchecks/viewUser/:userId',
                //template: '<section><embed ng-src="{{vm.content}}" style="width:200px;height:200px;"></embed><embed ng-src="{{vm.content2}}" style="width:200px;height:200px;"></embed></section>',
                templateUrl: 'modules/bgchecks/views/view-bgcheck.client.view.html',
                parent: 'fixed-opaque',
                controller: 'BgCheckUserController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    url: function () {
                        return 'modules/bgchecks/img/defaultReport.pdf';
                    }
                }
            });
    }

    BgCheckRoutes.$inject = ['$stateProvider'];
    resolveReports.$inject = ['Reports', '$stateParams'];
    ReportListController.$inject = ['reports', '$stateParams'];

    //Setting up route
    angular.module('bgchecks')
        .config(BgCheckRoutes)
        .controller('ReportListController', ReportListController);

})();
