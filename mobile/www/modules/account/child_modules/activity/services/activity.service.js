(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityService', activityService);

    activityService.$inject = ['settings', '$http', '$q', '$ionicPopup', 'utilsService'];

    function activityService(settings, $http, $q, $ionicPopup, utilsService) {

        var service = {
            getFeed: getFeed,
            postActivityToFeed: postFeed,
            getFeedActivityById: getFeedActivityById,
            getLastActivityWithCoord: getLastActivityWithCoord,
            getFeedIds: getFeedIds,
            postComment: postComment,
            likeActivity: likeActivity,
            getDistanceBetween: getDistanceBetween,
            showPopup: showPopup,
            getPlaceName: getPlaceName,
            hasCoordinates: hasCoordinates
        };

        var feed = [];
        var items = [];

        /**
         * @desc Get all feed, then load all posts by ids
         * @returns {Promise} promise with all feed items
         */
        function getFeed() {
            return $http.get(settings.feed)
                .then(function (response) {
                    items = response.data.items;
                    return $q(function (resolve, reject) {
                        if (items.length > 0) {
                            return resolve(populateActivityFeed(items));
                        } else {
                            reject('no feed');
                        }
                    });
                }, function (response) {
                    showPopup('Error', response.message);
                    return response;
                });
        }

        function loadItems(num) {
            var itemId = items[num];
            getFeedActivityById(itemId).then(function (result) {
                console.log('Pushing Activity to Feed: ', result);
                feed.unshift(result);
                if (num < items.length - 1) {
                    num++;
                    loadItems(num);
                } else {
                    return feed;
                }
            });
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
            console.log('Iterating over %d feed IDs to populate', feed.length, feed);
            start = start || 0;
            count = count || undefined;

            /**
             * Look at feed IDs `start` to `start+count` and 
             */
            var promises = feed.slice(start, count)
                .map(function (value, index) {
                    // TODO: Ensure that value is string, not object
                    return getFeedActivityById(value).then(
                        function (feedItem) {
                            if (hasCoordinates(feedItem)) {
                                feedItem.location = {
                                    type: feedItem.location.type,
                                    coordinates: feedItem.location.coordinates
                                }
                            }
                            feed[start + index] = feedItem;
                            return feedItem;
                        })
                });
            return $q.all(promises).then(function (results) {
                console.log('Resolved %d feed activities to populated feed', results.length, feed);
                return feed;
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
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function getFeedIds() {
            return $http.get(settings.feed)
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function postFeed(data) {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            return $http.post(settings.feed, utilsService.serialize(data))
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function postComment(id, data) {
            return $http.post(settings.feed + id + '/comments', utilsService.serialize(data))
                .then(function (response) {
                    return response;
                }, function (response) {
                    console.log(response);
                    showPopup(response.statusText, response.data.message);
                    return response;
                });
        }

        function likeActivity(id) {
            return $http.post(settings.feed + id + '/likes', null)
                .then(function (response) {
                    return response;
                }, function (response) {
                    console.log(response);
                    showPopup(response.statusText, response.data.message);
                    return response;
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
                    unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false
                }, function (response, status) {
                    if (status !== google.maps.DistanceMatrixStatus.OK) {
                        activityService.showPopup('Google maps failed', status);
                        reject('error');
                    } else {
                        if (response.rows[0].elements[0].distance) {
                            resolve((response.rows[0].elements[0].distance.value / 1609.344).toFixed(2) );//miles
                            //resolve(response.rows[0].elements[0].distance.value / 1000);// km
                        } else {
                            resolve(null);
                        }
                    }
                })
            })
        }

        /**
         * @desc Geocoded position name by coordinates
         * @param {Object} latlng - coordinates
         * @returns {Promise} promise with formatted address
         */
        function getPlaceName(latlng) {
            console.log('getPlaceName()');
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
                            showPopup('Geocoder failed', 'No results found');
                            reject('Geocoder failed');
                        }
                    } else {
                        showPopup('Geocoder failed', status);
                        reject('Geocoder failed');
                    }
                });
            });
        }
        
        function hasCoordinates(activity) {
            return (!!activity.location && !!activity.location.coordinates && !!activity.location.coordinates.length);
        }

        /**
         * @desc get last item of array with coordinates
         * @returns {Object} last item
         */
        function getLastActivityWithCoord() {
            for(var i = 0; i < feed.length; i++) {
                if(hasCoordinates(feed[i])) {
                    return feed[i];
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
        return service;
    }
})();
