'use strict';

function LicenseController($scope) {
	$scope.hello = function () {
		alert('[LicenseController] Hello!');
	};

	$scope.license = { type : 'test', number : '12345', state : 'CA', issued : new Date('2014-07-01'), expired : new Date('2014-07-01'), endorsements : 'none'};
}

LicenseController.$inject = ['$scope'];

angular
	.module('users')
	.controller('LicenseController', LicenseController);