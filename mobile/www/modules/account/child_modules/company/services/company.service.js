(function () {
    'use strict';

    angular
        .module('profile')
        .factory('CompanyService', CompanyService);

    CompanyService.$inject = ['$http', '$q', 'settings', 'activityService'];

    function CompanyService ($http, $q, settings, activityService) {

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
            applyToJob: applyToJob,
            getJobApplicationStatus: getJobApplicationStatus,
            loadFeed: loadFeedForCompany,
            follow: followCompany,
            unfollow: unfollowCompany
        };

        function getCompany (companyId) {
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
                function success (response) {
                    companyPromiseAges[companyId] = moment();
                    return response.data;
                })
                .catch(function fail (err) {
                    companyPromises[companyId] = null;
                    return $q.reject(err, 'No Company found for ID ' + companyId);
                });

            return companyPromises[companyId];
        }

        function listCompanies (query) {
            return $http.get(settings.companies, { params: query || {} }).then(
                function success (response) {
                    return response.data;
                })
                .catch(function fail (err) {
                    return $q.reject(err, 'No Companies found for Query [' + JSON.stringify(query || {}) + ']');
                });

        }

        function loadJobsForCompany (companyId) {
            if (_.isEmpty(companyId)) {
                return $q.reject('No Company ID Specified');
            }

            var jobsUrl = settings.companies + companyId + '/jobs';

            return activityService.getCurrentCoords()
                .then(function (coordinates) {
                    return $http({
                        url: jobsUrl,
                        method: 'GET',
                        params: { lat: coordinates.lat, long: coordinates.long }
                    });
                })
                .catch(function err () {
                    return $http.get(jobsUrl);
                })
                .then(function success (response) {
                    logger.debug('Found jobs for Company [' + companyId + ']', response.data);
                    return response.data;
                })
                .catch(function fail (err) {
                    logger.error('No Jobs found for Company [' + companyId + ']', err);
                    return $q.resolve([]);
                });
        }

        function applyToJob (jobId) {
            if (_.isEmpty(jobId)) {
                return $q.reject('No Job ID Specified');
            }

            return $http.post(settings.jobs + jobId + '/apply').then(
                function success (response) {
                    return response.data;
                })
                .catch(function fail (err) {
                    return $q.reject(err, 'Unable to Apply to Job');
                });
        }

        function getJobApplicationStatus (job) {
            if (_.isEmpty(job)) {
                return $q.resolve({ status: null });
            }

            var jobId = job && job.id || job;

            return $http.get(settings.jobs + jobId + '/apply')
                .then(function success (response) {
                    if (_.isObject(response.data) && !!response.data.status) {
                        return response.data;
                    }

                    throw new Error('Unknown Response');
                })
                .catch(function fail (err) {
                    logger.error('Failed to load application status for job ID ' + jobId, err);

                    if (!!job.applicationStatus) {
                        return { status: job.applicationStatus };
                    }

                    return { status: null };
                });
        }

        function loadFeedForCompany (companyId) {
            if (_.isEmpty(companyId)) {
                return $q.reject('No Company ID Specified');
            }

            return $http.get(settings.companies + companyId + '/feed').then(
                function success (response) {
                    return response.data;
                })
                .catch(function fail (err) {
                    return $q.reject(err, 'No Feed found for Company [' + companyId + ']');
                });
        }

        function followCompany (companyId) {
            if (_.isEmpty(companyId)) {
                return $q.reject('No Company ID Specified');
            }

            return $http.post(settings.companies + companyId + '/follow').then(
                function success (response) {
                    return response.data;
                })
                .catch(function fail (err) {
                    return $q.reject(err, 'Unable to follow Company [' + companyId + ']');
                });
        }

        function unfollowCompany (companyId) {
            if (_.isEmpty(companyId)) {
                return $q.reject('No Company ID Specified');
            }

            return $http.delete(settings.companies + companyId + '/follow').then(
                function success (response) {
                    return response.data;
                })
                .catch(function fail (err) {
                    return $q.reject(err, 'Unable to follow Company [' + companyId + ']');
                });
        }

    }

})();
