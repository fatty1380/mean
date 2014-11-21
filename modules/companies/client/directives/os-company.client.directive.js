'use strict';

angular.module('companies').directive('osCompany', [
	function() {
		return {
			scope: {
				company: '=',
				inline: '='
			},
			templateUrl: 'modules/companies/views/templates/view-company.client.template.html',
			restrict: 'E',
			replace: true,
			controller: 'CompaniesController',
			controllerAs: 'ctrl'
		};
	}
]);
