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
        var latLng = null;
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
            console.log('$watch ',vm.where);
            if(vm.where) {
                setMarkerPosition();
            }
        }, true);

        //set coordinat
        function setMarkerPosition() {
            console.log('setMarkerPosition()');
            var position = null;
            var location = new google.maps.LatLng(vm.where.geometry.location.G, vm.where.geometry.location.K);

            console.log('position',position);
            console.log('vm.loc',vm.loc);

            if(vm.loc){
                position = vm.loc;
            }else{
                position = location;
            }

            marker.setPosition(position);
            infoWindow.setContent(vm.where.formatted_address)
            infoWindow.open(map, marker);
            setDistanceFromLastPost(position);
            vm.loc = null;
        }

        function setDistanceFromLastPost(position) {
            console.log('setDistanceFromLastPost()');
            var lastCoord = activityService.getLastFeed().location.coordinates;
            if(lastCoord) {
                var startPos = new google.maps.LatLng(lastCoord[0], lastCoord[1]);
                var endPos = position;
                activityService.getDistanceBetween(startPos, endPos)
                    .then(function(result) {
                        vm.distanceSinceLastPost = result + " km";
                    });
            }
        }

        function getCurrentPosition() {
            console.log('getCurrentPosition()');
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    var lat  = position.coords.latitude;
                    var long = position.coords.longitude;

                    latLng = new google.maps.LatLng(lat, long);
                    initMap();
                }, function(err) {
                    activityService.showPopup('Geocoder failed', err);
                });
        }


        function saveFeed() {
            $ionicLoading.show({
                template: 'post feed'
            });
            activityService.postFeed(vm.activity).then(function(result) {
                $ionicLoading.hide();
                console.log(result);
                vm.close(result._id);
            });
        }

        function initMap() {
            console.log('initMap()');
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 8,
                center: latLng,
                draggable:true,
                sensor: true,
                zoomControl:true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            marker = new google.maps.Marker({
                position: latLng,
                title: 'Point A',
                map: map,
                draggable: false
            });

            google.maps.event.addDomListener(map, 'click', function(e) {
                var latlng = { lat: e.latLng.G, lng: e.latLng.K };
                console.log('click',latlng);
                getPlaceName(latlng);
                vm.loc = latlng;
                vm.activity.location.coordinates = [e.latLng.G, e.latLng.K];
            });

           infoWindow = new google.maps.InfoWindow({
                content:  ''
            });

            getPlaceName(latLng);
        }

        function getPlaceName(latlng) {
            console.log('getPlaceName()');
            if(!geocoder){
                var geocoder = new google.maps.Geocoder;
            }
            geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                      //  vm.loc = latlng;
                        vm.where = results[1];
                        console.log(vm.where);
                         $scope.$digest();
                    } else {
                        activityService.showPopup('Geocoder failed', 'No results found');
                    }
                } else {
                    activityService.showPopup('Geocoder failed', status);
                }
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