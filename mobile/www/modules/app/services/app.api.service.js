angular.module(AppConfig.appModuleName)
	.factory('API', serverConnectionService);

function serverConnectionService($http) {
	var service = {
		serialize: serializeData,
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
			data: data, // !needSerialize ? serializeData(data) : data,
			timeout: 30 * 1000 // one minute timeout
		})
	}

	function serializeData(data) {
		if (!angular.isObject(data)) {
			return ((data == null) ? '' : data.toString());
		}
		var buffer = [];
		for (var name in data) {
			if (!data.hasOwnProperty(name)) {
				continue;
			}
			var value = data[name];
			buffer.push(
				encodeURIComponent(name) +
				'=' +
				encodeURIComponent((value == null) ? '' : value)
                );
		}
		var source = buffer
			.join('&')
			.replace(/%20/g, '+')
			;
		return (source);
	}
}
