/* global moment */
/* global logger */
/* global _ */
(function () {
    'use strict';

    angular
        .module('profile')
        .factory('CompanyService', CompanyService);

    CompanyService.$inject = ['$http', '$q', 'settings'];

    function CompanyService($http, $q, settings) {
        
        /**
         * Rudimentary Cache for Company Data
         * 
         * companyId: {date, promise}
         */
        var companyPromises = {};
        var companyPromiseAges = {};

        return {
			get: getCompany,
			list: listCompanies,
			loadJobs: loadJobsForCompany,
            loadFeed: loadFeedForCompany,
            follow: followCompany,
            unfollow: unfollowCompany
        };
		
        function getCompany(companyId) {
            if (_.isEmpty(companyId)) {
                return $q.reject('No Company ID Specified');
            }

            var existingP = companyPromises[companyId];
            var age = companyPromiseAges[companyId];

            if (!_.isEmpty(existingP) && (_.isEmpty(age) || age.isAfter(moment().subtract(15, 'm')))) {
                logger.info('Returning Cached Company Information');
                return existingP;
            }
			
			companyPromises[companyId] = $http.get(settings.companies + companyId).then(
                function success(response) {
                    companyPromiseAges[companyId] = moment();
					return response.data;
                })
                .catch(function fail(err) {
                    companyPromises[companyId] = null;
					return $q.reject(err,'No Company found for ID ' + companyId);
                });
                
            return companyPromises[companyId];
		}
		
		function listCompanies(query) {
            return $http.get(settings.companies, { params: query || {} }).then(
                function success(response) {                    
                    return response.data;
                })
                .catch(function fail(err) {
                    return $q.reject(err,'No Companies found for Query [' + JSON.stringify(query || {}) + ']');
                });
            
		}

        function loadJobsForCompany(companyId) {
			if (_.isEmpty(companyId)) {
				return $q.reject('No Company ID Specified');
			}
            return $http.get(settings.companies + companyId + '/jobs').then(
                function success(response) {
                    return response.data;
                })
                .catch(function fail(err) {
                    return $q.reject(err,'No Jobs found for Company [' + companyId + ']');
                });
        }
        
        function loadFeedForCompany(companyId) {
			if (_.isEmpty(companyId)) {
				return $q.reject('No Company ID Specified');
            }
            
            return $http.get(settings.companies + companyId + '/feed').then(
                function success(response) {
                    return response.data;
                })
                .catch(function fail(err) {
                    return $q.reject(err,'No Feed found for Company [' + companyId + ']');
                });
        }
        
        function followCompany(companyId) {
			if (_.isEmpty(companyId)) {
				return $q.reject('No Company ID Specified');
            }
            
            return $http.post(settings.companies + companyId + '/follow').then(
                function success(response) {
                    return response.data;
                })
                .catch(function fail(err) {
                    return $q.reject(err,'Unable to follow Company [' + companyId + ']');
                });
        }
        
        function unfollowCompany(companyId) {
			if (_.isEmpty(companyId)) {
				return $q.reject('No Company ID Specified');
			}
            
            return $http.delete(settings.companies + companyId + '/follow').then(
                function success(response) {
                    return response.data;
                })
                .catch(function fail(err) {
                    return $q.reject(err,'Unable to follow Company [' + companyId + ']');
                });
        }

    }

})();
