(function() {
    'use strict';

    /* @ngInject */
    function NewApplicationDirective() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            transclude: true,
            templateUrl: 'modules/jobs/views/templates/os-new-application-modal.client.template.html',
            restrict: 'EA',
            scope: {
                job: '&',
                title: '@?'
            },
            controller: 'NewApplicationModalController'
        };

        return directive;
    }

    function NewApplicationModalController($scope, $modal, $log) {

        $scope.isOpen = false;

        $scope.showModal = function(size, job) {
            var modalInstance = $modal.open({
                templateUrl: 'applyModal.html',
                controller: 'AppModalInstanceController'
            });

            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                console.info('Modal dismissed at: ' + new Date());
            });
        };
    }

    function AppModalInstanceController($scope, $modalInstance, pJob) {
        $scope.selected = {
            id: null
        };
        $scope.passed_job = pJob;
        $scope.job = $scope.job || pJob;

        $scope.ok = function() {
            $modalInstance.close($scope.selected.id);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }

    NewApplicationModalController.$inject = ['$scope', '$modal', '$log'];

    angular
        .module('jobs')
        .directive('osNewApplication', NewApplicationDirective)
        .controller('NewApplicationModalController', NewApplicationModalController)
        .controller('AppModalInstanceController', AppModalInstanceController);
})();
