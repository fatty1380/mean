/*
(function () {
    'use strict';

    angular
        .module('activity')
        .service('activityAddService', activityAddService);

    activityAddService.$inject = ['modalService','$scope'];

   function activityAddService(modalService, $scope) {
       var vm = this;
       vm.close = close;

       vm.entry = {
           id: 'addId',
           zoom: 2
       };

       vm.options = {
           draggable: true,
           labelContent: "E",
           labelAnchor: "100 0",
           labelClass: "marker-labels"
       };

       vm.map = {
           events: {
               click: function (map, eventName, originalEventArgs) {
                   console.log(originalEventArgs);
                 /!*  var e = originalEventArgs[0];
                   var lat = e.latLng.lat(), lon = e.latLng.lng();
                   var marker = {
                       id: Date.now(),
                       coords: {
                           latitude: lat,
                           longitude: lon
                       }
                   };
                   $scope.map.markers.push(marker);
                   console.log($scope.map.markers);
                   $scope.$apply();*!/
               }
           },
          center : { latitude: 39.904903, longitude: -75.230039 },
          markerCoords : { latitude: 39.904903, longitude: -75.230039}
       }

       $scope.map1 = {
           events: {
               click: function (map, eventName, originalEventArgs) {
                   console.log(originalEventArgs);
                   /!*  var e = originalEventArgs[0];
                    var lat = e.latLng.lat(), lon = e.latLng.lng();
                    var marker = {
                    id: Date.now(),
                    coords: {
                    latitude: lat,
                    longitude: lon
                    }
                    };
                    $scope.map.markers.push(marker);
                    console.log($scope.map.markers);
                    $scope.$apply();*!/
               }
           },
           center : { latitude: 39.904903, longitude: -75.230039 },
           markerCoords : { latitude: 39.904903, longitude: -75.230039},
           zoom: 4,
           bounds: {}
       };



        function close(name){
            modalService.close(name);
        }
    };
})();
*/
