(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityService', activityService );

    activityService.$inject = ['settings','$http', '$q', '$ionicPopup'];

    function activityService(settings, $http, $q, $ionicPopup) {
        var feed = [];
        var num = 0;
        var ids = [];

        //load all feed ids, then load all posts by id and return all feed
        function getFeed() {
            return  $http.get(settings.feed)
                .then(function (response) {
                    ids = response.data.activity;
                    return $q(function(resolve, reject) {
                        loadItems(num);
                        function loadItems(num) {
                             getFeedById(ids[num]).then(function(result) {
                                var entry = {
                                    user: result.user.displayName,
                                    created: result.location[0].created,
                                    message: result.message,
                                    title: result.title,
                                    comments: result.comments,
                                    milesTraveled: '300 miles',//hardcoded
                                    likes: ['some value', 'some value','some value'],//hardcoded
                                    location: {
                                        type: result.location[0].type,
                                        coordinates: result.location[0].coordinates
                                    }
                                };
                                feed.unshift(entry);
                                if( num < ids.length - 1 ){
                                    num++;
                                    loadItems(num);
                                }else{
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

        //return activity by id
        function getFeedById(id) {
            return  $http.get(settings.feed + id)
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    showPopup("Error", response);
                    return response;
                });
        }

        function postFeed(data) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
            return  $http.post(settings.feed,serialize(data))
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    showPopup("Error", response);
                    return response;
                });
        }

        function getDistanceBetween(start, finish) {
            var service = new google.maps.DistanceMatrixService;
            return $q(function(resolve, reject) {
                service.getDistanceMatrix({
                    origins: [start],
                    destinations: [finish],
                    travelMode: google.maps.TravelMode.DRIVING,
                    unitSystem: google.maps.UnitSystem.METRIC,
                    avoidHighways: false,
                    avoidTolls: false
                }, function(response, status) {
                    if (status !== google.maps.DistanceMatrixStatus.OK) {
                        activityService.showPopup('Google maps failed', status);
                        reject("error");
                    } else {

                        if(response.rows[0].elements[0].distance){
                            resolve(response.rows[0].elements[0].distance.value/1000);
                        }else{
                            resolve(null);
                        }
                    }
                })
            })
        }

        function getLastFeed() {
            //last post at array startpoint
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
            for(var p in obj) {
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
            showPopup: showPopup
        }
    }
})();
