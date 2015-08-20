(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityService', activityService);

    activityService.$inject = ['settings','$http'];

    function activityService(settings, $http) {
        var feed = [];

        //return all feed ids
        function getFeed() {
            return  $http.get(settings.feed)
                .then(function (response) {
                    feed = response.data.activity;
                    return feed;
                }, function (response) {
                    return feed;
                });
        }

        //return activity by id
        function getFeedById(id) {
            return  $http.get(settings.feed + id)
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    return response;
                });
        }

        function postFeed(data) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
            return  $http.post(settings.feed,serialize(data))
                .then(function (response) {
                    return response.data;
                }, function (response) {
                    return response;
                });
        }

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
            feed: getFeed,
            postFeed: postFeed,
            getFeedById: getFeedById
        }
    }
})();
