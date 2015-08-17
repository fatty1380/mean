(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope'];

    function ActivityAddCtrl($scope) {
        var vm = this;

        vm.close = function () {
            $scope.closeModal(null);
        }
    }
})();


/*
(function() {
    'use strict'

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = [];

    function ActivityAddCtrl() {}
})();
*/
