'use strict';

function LicenseController($scope) {
	$scope.hello = function () {
		alert('[LicenseController] Hello!');
	};

	$scope.license = { type : '', number : '', state : '', issued : null, expired : null, endorsements : []};
}

LicenseController.$inject = ['$scope'];

angular
	.module('users')
	.controller('LicenseController', LicenseController);