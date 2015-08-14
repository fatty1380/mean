(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityService', activityService);

    activityService.$inject = ['settings','$http'];

    function activityService(settings, $http) {
        var vm = this;
        var feed = [];


        var FEED = [
            {
                user: '55a8c832f58ef0900b7ca14c',//test@test.test
                created: '12-05-2010',
                message: 'James has checked in the San Francisco at the Flying Jay',
                milesTraveled: '300 miles',
                likes: ['some value', 'some value','some value'],
                location: {
                    type: 'Point',
                    coordinates: [39.904903, -75.230039]
                }
            },
            {
                user: '55a5317e4cec3d4a40d4bfa9', //markov
                created: '19-01-2013',
                message: 'Some text about checked in place.',
                milesTraveled: '12 miles',
                likes: ['some value', 'some value', 'some value' ,'some value' ,'some value'],
                location: {
                    type: 'Point',
                    coordinates: [39.644489, -75.725896],
                    created: '2015-07-12T01:34:43.000Z',
                    modified: '2015-07-12T01:34:43.000Z'
                }
            },
            {
                user: 'sssss',
                created: '25-05-1929',
                message: 'Some text about checked in place. 150 miles!',
                milesTraveled: '150 miles',
                likes: ['some value', 'some value', 'some value' ,'some value' ,'some value'],
                location: {
                    type: 'Point',
                    coordinates: [39.123111, -78.982111],
                    created: '2015-07-12T01:34:43.000Z',
                    modified: '2015-07-12T01:34:43.000Z'
                }
            }
        ];


        function getFeed() {
            return  $http.get(settings.feed)
                .then(function (response) {
                    feed = response.activity;

                    console.log(response);
                    return feed;
                }, function (response) {
                   // feed = FEED;
                    return FEED;
                });
        }

        return {
            feed: getFeed
        }
    }


})();
