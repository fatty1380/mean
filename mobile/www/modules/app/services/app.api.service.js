angular.module(AppConfig.appModuleName)
	.factory('API', serverConnectionService);

function serverConnectionService($http) {
	var service = {
		doRequest: doApiRequest
	};

	return service;
        
	//////////////////////////////////////////////////////
        
	// TODO: Verify in all places that replacement of 'application/form-encoded'
	// with 'application/json' will work properly ... seriosuly, who does that?
	function doApiRequest(apiUrl, method, data, needSerialize) {
		return $http({
			url: apiUrl,
			method: method,
			data: data, 
			timeout: 30 * 1000 
		})
	}
}
