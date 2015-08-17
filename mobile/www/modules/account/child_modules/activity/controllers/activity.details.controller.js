(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityDetailsCtrl', ActivityDetailsCtrl);

    ActivityDetailsCtrl.$inject = ['$scope', 'parameters'];

    function ActivityDetailsCtrl($scope, parameters) {
        var vm = this;
        vm.entry = parameters.entry;

        vm.close = function () {
            $scope.closeModal(vm.entry);
        }
    }

})();
