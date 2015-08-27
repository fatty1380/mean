(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityService', activityService);

    activityService.$inject = ['settings', '$http', '$q', '$ionicPopup'];

    function activityService(settings, $http, $q, $ionicPopup) {
        var feed = [];
        var num = 0;
        var ids = [];

        /**
         * @desc Get all feed, then load all posts by ids
         * @returns {Promise} promise with all feed items
         */
        function getFeed() {
            return $http.get(settings.feed)
                .then(function (response) {
                    ids = response.data.activity;
                    return $q(function (resolve, reject) {
                        if (ids.length > 0) {
                            return resolve(populateActivityFeed(response.data));
                            loadItems(num);
                        } else {
                            reject("no feed");
                        }


                        return;

                        function loadItems(num) {
                            getFeedById(ids[num]).then(function (result) {
                                console.log(result);
                                // var entry = {
                                //     user: result.user.displayName,
                                //     //created: result.location[0].created,
                                //     message: result.message,
                                //     title: result.title,
                                //     comments: result.comments,
                                //     //milesTraveled: '300 miles',//hardcoded
                                //     //likes: ['some value', 'some value', 'some value']//hardcoded
                                //     props: result.props
                                // };

                                var entry = result;

                                console.log('Deciding on adding location: ', result.location);
                                if (!!result.location && !!result.location[0]) {
                                    entry.location = {
                                        type: result.location[0].type,
                                        coordinates: result.location[0].coordinates
                                    }
                                }
                                feed.unshift(entry);
                                if (num < ids.length - 1) {
                                    num++;
                                    loadItems(num);
                                } else {
                                    resolve(feed);
                                }
                            });
                        }

                    });
                }, function (response) {
                    showPopup("Error", response);
                    return response;
                });

        }

        function populateActivityFeed(rawFeed) {

            var activities = rawFeed.activity.reverse();
            
            var start = 0;
            var count = undefined;
            
            var promises = activities.slice(start, count).map(function (value, index) {
                return getFeedById(value).then(function (feedItem) {
                    if (!!feedItem.location && !!feedItem.location[0]) {
                        feedItem.location = {
                            type: feedItem.location[0].type,
                            coordinates: feedItem.location[0].coordinates
                        }
                    }

                    activities[start + index] = feedItem;
                    
                    return feedItem;
                })
            });

            return $q.all(promises).then(function (results) {
                console.log(results);
                console.log(activities);
                
                return activities;
            })
        }

        /**
         * @desc Get feed by id
         * @param {Number} id - feed id
         * @returns {Promise} promise feed data
         */
        function getFeedById(id) {
            return $http.get(settings.feed + id)
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    showPopup("Error", response);
                    return response;
                });
        }

        function postFeed(data) {
            console.log('Posting new feed item', data);
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
            return $http.post(settings.feed, serialize(data))
                .then(function (response) {
                    console.log('Posted new feed item', response.data);
                    return response.data;
                }, function (response) {
                    showPopup("Error", response);
                    return response;
                });
        }

        /**
         * @desc Calculate distance between 2 points by road
         * @param {Object} start - start coordinates
         * @param {Object} finish - finish coordinates
         * @returns {Promise} promise with distance in km
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
                        reject("error");
                    } else {

                        if (response.rows[0].elements[0].distance) {
                            resolve(response.rows[0].elements[0].distance.value / 1000);
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
                            reject("Geocoder failed");
                        }
                    } else {
                        showPopup('Geocoder failed', status);
                        reject("Geocoder failed");
                    }
                });
            });
        }

        /**
         * @desc last item of array
         * @returns {Promise} promise lst item
         */
        function getLastFeed() {
            return feed[0];
        }

        function showPopup(title, text) {
            $ionicPopup.alert({
                title: title || "title",
                template: text || "no message"
            });
        };

        function serialize(obj, prefix) {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push(typeof v == "object" ?
                        serialize(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        }

        return {
            getFeed: getFeed,
            postFeed: postFeed,
            getFeedById: getFeedById,
            getLastFeed: getLastFeed,
            getDistanceBetween: getDistanceBetween,
            showPopup: showPopup,
            getPlaceName: getPlaceName
        }
    }
})();
