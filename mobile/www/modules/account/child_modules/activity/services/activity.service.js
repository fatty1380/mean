(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityService', activityService);

    activityService.$inject = ['settings', '$http', '$q', '$ionicPopup', 'utilsService', 'userService'];

    function activityService(settings, $http, $q, $ionicPopup, utilsService, userService) {

        var service = {
            getFeed: getFeed,
            getCompanyFeed: getCompanyFeed,
            postActivityToFeed: postFeed,
            getFeedActivityById: getFeedActivityById,
            getLastActivityWithCoord: getLastActivityWithCoord,
            getFeedIds: getFeedIds,
            getMyFeedIds: getMyFeedIds,
            postComment: postComment,
            getComments: getComments,
            likeActivity: likeActivity,
            getDistanceBetween: getDistanceBetween,
            getSLDistanceBetween: getSLDistanceBetween,
            showPopup: showPopup,
            getPlaceName: getPlaceName,
            hasCoordinates: hasCoordinates,
            changeFeedSource: changeFeedSource,
            getFeedData: getFeedData,
            loadMore: loadMore,
            getAvatar: getAvatar
        };
        
        var vm = this;

        var feed = [];
        var items = [];
        var activityItems = []; //my posts
        
        Object.defineProperty(vm, 'FEEDER_CONFIG', {
            enumerable: true,
            get: function () {
                return {
                    start: -1,
                    loaded: 0,
                    step: 50
                };
            }
        });
        
        var feeder = vm.FEEDER_CONFIG;

        var feedSource = 'items';
        var feedData = {
            activity: {
                feedSource: 'activity',
                buttonName: 'My Logs',
                loadingText: 'Loading My Logs'
            },
            items: {
                feedSource: 'items',
                buttonName: 'Activity',
                loadingText: 'Loading Activity Feed'
            }
        }
        
        return service;
        
        /////////////////////////////////////////////////////////////////////////////////

        function changeFeedSource(source) {
            var src = feedSource;
            source = /activity|items/i.test(source) ? source : null;
            feedSource = source || (feedSource === 'activity') ? 'items' : 'activity';

            $cordovaGoogleAnalytics.trackEvent('Activity', 'change-feed', feedSource, feedData[feedSource].length);

            return src !== feedSource;
        }

        function getFeedData() {
            return feedData[feedSource];
        }

        /**
         * @desc Get all feed, then load all posts by ids
         * @returns {Promise} promise with all feed items
         */
        function getFeed() {
            return $http.get(settings.feed)
                .then(feedRequestSuccess, feedRequestError);
        }

        function getCompanyFeed(company) {
            var id = !!company && company.id || company;
            return $http.get(settings.companies + id + '/feed').then(
                feedRequestSuccess,
                feedRequestError
                );
        }

        function feedRequestSuccess(response) {
            logger.debug(response);

            feeder = vm.FEEDER_CONFIG;

            items = _.uniq(response.data[feedSource].reverse()) || [];
            activityItems = _.uniq(response.data.activity.reverse()) || [];
            return $q(function (resolve, reject) {
                if (items.length > 0) {
                    return resolve(populateActivityFeed(items, feeder.start, feeder.step));
                } else {
                    reject('no feed');
                }
            });
        }

        function feedRequestError(response) {
            //showPopup('Error', response.message);
            logger.error('Unable to load Feed', response.data)
            return [];
        }

        function loadMore() {
            logger.debug('[activityService.loadMore] Loading Updates');
            debugger;
            return populateActivityFeed(items, feeder.start, feeder.step);
        }
        
        /**
         * Populate Activity Feed
         * @param rawFeedActivities - An array of FeedActivity Objects. Differnet from the local var 'feed'
         * @param start - Integer representing at which index to start population (default: 0)
         * @param count - Integer representing how many items to populate (default: all)
         * 
         * @description This method will map over the IDs in teh activity array of the 
         */
        function populateActivityFeed(rawFeedActivities, start, count) {
            feed = rawFeedActivities;
            start = start + 1 || 0;
            count = count || undefined;


            logger.debug('Iterating over ' + feed.length + ' feed IDs to populate ' + count + ' from ' + start);

            /**
             * Look at feed IDs `start` to `start+count` and 
             */
            var itemsToResolve = feed.slice(start, count);
            feed = [];
            
            if (!itemsToResolve || !itemsToResolve.length) {
                logger.debug('No more activities');
                return $q.when([]);
            }


            var promises = itemsToResolve.map(function (value, index) {
                if(!angular.isString(value)) return value;
                return getFeedActivityById(value).then(
                    function (feedItem) {
                        //logger.debug('Loaded Feed item #' + index + '. Feeder: ', feeder);
                        feeder.loaded++;
                        
                        if (_.isEmpty(feedItem)) {
                            return null;
                        }

                        if (hasCoordinates(feedItem)) {
                            feedItem.location = {
                                type: feedItem.location.type,
                                coordinates: feedItem.location.coordinates
                            }
                        }

                        feeder.start = Math.max(feeder.start, index);

                        feed[start + index] = feedItem;
                        return feedItem;
                    })
                });

            return $q.all(promises).then(function (results) {
                logger.debug('Resolved %d feed activities to populated feed', results.length, feed);

                var sorted = _.compact(feed).sort(function (a, b) {
                    if (angular.isString(a) && angular.isString(b)) { return 0; }
                    var x = Date.parse(b.created) - Date.parse(a.created);
                    var y = x > 0 ? 1 : x < 0 ? -1 : 0;
                    ///var word = y == 1 ? 'after' : 'before';
                    //logger.debug('Feed Item %s is %s than %s (%s %s %s)', a.title, word, b.title, a.created, word, b.created);
                    return y
                });

                logger.debug('Sorted %d feed activities to populated feed', results.length, sorted);
                return sorted;
            })
        }

        /**
         * @desc Get feed by id
         * @param {Number} id - feed id
         * @returns {Promise} promise feed data
         */
        function getFeedActivityById(id) {
            return $http.get(settings.feed + id)
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    logger.error(response, 'Unable to lookup Activity Feed');
                    return null;
                });
        }

        function getFeedIds() {
            return $http.get(settings.feed)
                .then(function (response) {
                    return response.data[feedSource];
                }, function (response) {
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function getMyFeedIds() {
            return $http.get(settings.feed)
                .then(function (response) {
                    return response.data.activity;
                }, function (response) {
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function postFeed(data) {

            return $http.post(settings.feed, data)
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function postComment(id, data) {
            return $http.post(settings.feed + id + '/comments', data)
                .then(function (response) {
                    return response;
                }, function (response) {
                    logger.debug(response);
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function getComments() {
            return $http.get(settings.feed)
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function likeActivity(id) {
            var index = _.findIndex(feed, { id: id });
            
            return $http.post(settings.feed + id + '/likes', null)
                .then(function (response) {
                    var likes = response.data || [];
                    
                    if (index !== -1) {
                        feed[index].likes = likes
                    }
                    return likes;
                }, function (response) {
                    
                    if (response.status != 403) {
                        logger.error('Unable to like Post', response);
                    }
                    
                    // Return the existing likes array (if present) or an empty array if not;
                    return index !== -1 && feed[index].likes || [];
                });
        }

        /**
         * @desc Calculate distance between 2 points by road
         * @param {Object} start - start coordinates
         * @param {Object} finish - finish coordinates
         * @returns {Promise} promise with distance in miles
         */
        function getDistanceBetween(start, finish) {
            var service = new google.maps.DistanceMatrixService;
            return $q(function (resolve, reject) {
                service.getDistanceMatrix({
                    origins: [start],
                    destinations: [finish],
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.IMPERIAL,
                    avoidHighways: false,
                    avoidTolls: false
                }, function (response, status) {
                    if (status !== google.maps.DistanceMatrixStatus.OK) {
                        //activityService.showPopup('Google maps failed', status);
                        reject('error');
                    } else {
                        if (response.rows[0].elements[0].distance) {
                            resolve((response.rows[0].elements[0].distance.value / 1609.344).toFixed(0));//miles
                            //resolve(response.rows[0].elements[0].distance.value / 1000);// km
                        } else {
                            resolve(null);
                        }
                    }
                })
            })
        }

        /**
         * @desc Calculate Straight-Line (Crow-flies) distance between 2 points
         * @param {Object} start - start coordinates
         * @param {Object} finish - finish coordinates
         * @returns {Promise} promise with distance in miles
         */
        function getSLDistanceBetween(start, finish) {
            var dist = google.maps.geometry.spherical.computeDistanceBetween(start, finish);

            return $q.when((dist / 1609.344).toFixed(0));
        }

        /**
         * @desc Geocoded position name by coordinates
         * @param {Object} latlng - coordinates
         * @returns {Promise} promise with formatted address
         */
        function getPlaceName(latlng) {
            logger.debug('getPlaceName()');
            if (!geocoder) {
                var geocoder = new google.maps.Geocoder;
            }

            return $q(function (resolve, reject) {
                geocoder.geocode({ 'location': latlng }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            /*marker.info = new google.maps.InfoWindow({
                             content:  results[1].formatted_address
                             });*/
                            resolve(results[1]);
                        } else if (results[0]) {
                            resolve(results[0]);
                        } else {
                            //showPopup('Geocoder failed', 'No results found');
                            reject('Geocoder failed');
                        }
                    } else {
                        //showPopup('Geocoder failed', status);
                        reject('Geocoder failed');
                    }
                });
            });
        }

        function hasCoordinates(activity) {
            return (!!activity && !!activity.location && !!activity.location.coordinates && !!activity.location.coordinates.length);
        }

        /**
         * @desc get last item of array with coordinates
         * @returns {Object} last item
         */
        function getLastActivityWithCoord() {
            for (var i = 0; i < feed.length; i++) {
                if (feed[i].user && feed[i].user.id === userService.profileData.id) {
                    if (hasCoordinates(feed[i])) {
                        return feed[i];
                    }
                }
            }
            return null;
        }

        function showPopup(title, text) {
            $ionicPopup.alert({
                title: title || 'title',
                template: text || 'no message'
            });
        };
        
        function getAvatar(feedItem) {
            if (_.isEmpty(feedItem.user) || _.isString(feedItem.user)) {
                return null;
            }
            
            return userService.getAvatar(feedItem.user);
        }
    }
})();
