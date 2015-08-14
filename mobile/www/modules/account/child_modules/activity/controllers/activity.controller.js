(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityCtrl', ActivityCtrl);

    ActivityCtrl.$inject = ['modalService','activityService', 'activityDetailsService', '$ionicLoading', '$scope'];

    function ActivityCtrl(modalService, activityService, activityDetailsService, $ionicLoading, $scope) {
        var vm = this;

        vm.showModal  = showModal;
        vm.closeModal  = closeModal;

        //vm.map = { center: { latitude: 39.904903, longitude: -75.230039 }, zoom: 2 };

        $ionicLoading.show({
            template: 'loading feed'
        });

        activityService.feed().then(function(result) {
            $ionicLoading.hide();
            vm.feed = result;
        });



/*
        vm.map = {
            zoom:4,
            id: "eee",
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
*/


        $scope.map = {
            zoom:4,
            id: "eee",
            events: {
                click: function (map, eventName, originalEventArgs) {
                    console.log(originalEventArgs);
                    /*  var e = originalEventArgs[0];
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
                     $scope.$apply();*/
                }
            },
            center : { latitude: 39.904903, longitude: -75.230039 },
            markerCoords : { latitude: 39.904903, longitude: -75.230039},
            bounds: {}
        };

        function showModal(modalName, entry) {
            if(entry){
                activityDetailsService.setEntry(entry);
            }
            modalService.show(modalName);
        }

        function closeModal(modalName) {
            modalService.close(modalName);
        }
    }
})();
