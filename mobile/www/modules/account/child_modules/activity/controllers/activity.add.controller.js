(function() {
    'use strict';

    function ActivityAddCtrl($scope) {
        var vm = this;

        vm.close = function () {
            $scope.closeModal(null);
        }
    }

    ActivityAddCtrl.$inject = ['$scope'];

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);
})();
