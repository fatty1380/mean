(function () {
    'use strict';

    var activityService = function () {
        var vm = this;

        vm.feed = [
            {
               date: '12-05-2010',
               message: 'James has checked in the San Francisco at the Flying Jay',
               milesTraveled: '300 miles',
               likes: '12 likes'
            },
            {
                date: '19-01-2013',
                message: 'Some text about checked in place.',
                milesTraveled: '12 miles',
                likes: '0 likes'
            },
            {
                date: '25-05-1929',
                message: 'Some text about checked in place. 150 miles!',
                milesTraveled: '150 miles',
                likes: '2 likes'
            }
        ]

    };

    activityService.$inject = [];

    angular
        .module('activity')
        .service('activityService', activityService);
})();
