'use strict';

angular.module('jobs').directive('osJob', [
	function() {
		return {
			scope: {
				job: '=',
				inline: '='
			},
			templateUrl: 'modules/jobs/views/templates/job.client.template.html',
			restrict: 'E',
			replace: true,
			controller: 'JobsController',
			controllerAs: 'ctrl'
		};
	}
]);
