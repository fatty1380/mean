(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope','activityService', '$ionicLoading', '$cordovaGeolocation', '$q'];

    function ActivityAddCtrl($scope, activityService, $ionicLoading, $cordovaGeolocation, $q) {
        angular.element(document).ready(
            getCurrentPosition
        );

        var vm = this;
        var myCoordinates = null;
        var clickCoordinates = null;
        var map = null;
        var marker = null;
        var infoWindow = null;

        vm.activity = {
            title : '',
            message : '',
            location : {
                type: 'Point',
                coordinates:[],
                created: ''
            }
        }

        vm.distanceSinceLastPost = '';
        vm.saveFeed = saveFeed;

        $scope.$watch('vm.where', function() {
            if(vm.where) {
                setMarkerPosition();
            }
        }, true);

        /**
         * @desc geocode current position
         */
        function getCurrentPosition() {
            console.log('getCurrentPosition()');
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    var lat  = position.coords.latitude;
                    var long = position.coords.longitude;
                    myCoordinates = new google.maps.LatLng(lat, long);
                    initMap();
                }, function(err) {
                    activityService.showPopup('Geocoder failed', err);
                });
        }

        /**
         * @desc initialize map
         */
        function initMap() {
            console.log('initMap()');
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 8,
                center: myCoordinates,
                draggable:true,
                sensor: true,
                zoomControl:true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            marker = new google.maps.Marker({
                position: myCoordinates,
                title: 'Point A',
                map: map,
                draggable: false
            });

            google.maps.event.addDomListener(map, 'click', function(e) {
                var latlng = { lat: e.latLng.G, lng: e.latLng.K };
                console.log('click',latlng);
                activityService.getPlaceName(latlng)
                    .then(function(result) {
                        vm.where = result;
                    });

                clickCoordinates = latlng;
                vm.activity.location.coordinates = [e.latLng.G, e.latLng.K];
            });

            infoWindow = new google.maps.InfoWindow({
                content:  ''
            });

            //get location name after init
            activityService.getPlaceName(myCoordinates)
                .then(function(result) {
                    vm.where = result;
                });
        }

        /**
         * @desc set marker position
         */
        function setMarkerPosition() {
            console.log('setMarkerPosition()');
            var position = null;
            var location = new google.maps.LatLng(vm.where.geometry.location.G, vm.where.geometry.location.K);
            if(clickCoordinates){
                position = clickCoordinates;
            }else{
                position = location;
            }
            marker.setPosition(position);
            infoWindow.setContent(vm.where.formatted_address)
            infoWindow.open(map, marker);
            setDistanceFromLastPost(position);
            clickCoordinates = null;
        }

        /**
         * @desc calulate distance from last post and set to vm.distanceSinceLastPost
         * @param {Object} position - current coordinates
         */
        function setDistanceFromLastPost(position) {
              console.log('setDistanceFromLastPost()');
            var lastCoord = activityService.getLastFeed();
            if(lastCoord) {
                var startPos = new google.maps.LatLng(lastCoord.location.coordinates[0], lastCoord.location.coordinates[1]);
                var endPos = position;
                activityService.getDistanceBetween(startPos, endPos)
                    .then(function(result) {
                        vm.distanceSinceLastPost = result + " km";
                    });
            }
        }

        function saveFeed() {
            $ionicLoading.show({
                template: 'post feed'
            });
            activityService.postFeed(vm.activity).then(function(result) {
                $ionicLoading.hide();
                vm.close(result._id);
            });
        }

        vm.close = function (str) {
            $scope.closeModal(str);
        }
    }
})();

//get straight distance
/*console.log('calcDistance');
 console.log('km: ',calcDistance(startPos, endPos));
 console.log('miles: ',calcDistance(startPos, endPos) / 1.609344);
 function calcDistance(p1, p2){
 return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000 );
 }*/
