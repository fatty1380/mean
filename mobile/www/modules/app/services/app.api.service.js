angular.module(AppConfig.appModuleName)
	.factory('API', serverConnectionService);

function serverConnectionService($http) {
	var service = {
		serialize: serializeData,
		doRequest: doApiRequest
	};

	return service;
        
	//////////////////////////////////////////////////////
        
	function doApiRequest(apiUrl, method, data, needSerialize) {
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		return $http({
			url: apiUrl,
			method: method,
			data: !needSerialize ? serializeData(data) : data,
			timeout: 60 * 1000 // one minute timeout
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
