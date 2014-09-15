'use strict';

function HomeController($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
}

HomeController.$inject = ['$scope', 'Authentication'];

angular
    .module('core')
    .controller('HomeController', HomeController);
