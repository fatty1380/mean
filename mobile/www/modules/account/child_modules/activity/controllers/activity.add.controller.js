(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope','activityService', '$ionicLoading', '$ionicPlatform'];

    function ActivityAddCtrl($scope, activityService, $ionicLoading, $ionicPlatform) {
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
                placeName: '',
                placeId: '',
                type: 'Point',
                coordinates: [],
                created: ''
            },
            props:{
                freight: '',
                slMiles: ''
            }
        }

        vm.saveItemToFeed = saveItemToFeed;
        vm.close = close;
        vm.mapIsVisible = true;

        $scope.$watch('vm.where', function() {
            if(vm.where) {
                vm.activity.location.placeName = vm.where.formatted_address;
                vm.activity.location.placeId = vm.where.place_id;
                setMarkerPosition();
            }
        }, true);

        /**
         * @desc geocode current position
         */
        function getCurrentPosition() {
            if(navigator.geolocation) {
                $ionicPlatform.ready(function() {
                    $ionicLoading.show({
                        template: 'geocoding position',
                        duration: 10000
                    });
                    var posOptions = {timeout: 10000, enableHighAccuracy: false};

                    var onSuccess = function(position) {
                        console.log('*** sucess ***');
                        $ionicLoading.hide();
                        var lat = position.coords.latitude;
                        var long = position.coords.longitude;
                        myCoordinates = new google.maps.LatLng(lat, long);
                        vm.activity.location.coordinates = [lat, long];
                        console.log($ionicLoading);
                        initMap();
                    };
                    function onError(error) {
                        console.log('*** error ***');
                        $ionicLoading.hide();
                        //show only 1 error message
                        if(vm.mapIsVisible) {
                            $ionicLoading.show({
                                template: 'Geocoder failed </br>'+error.message ,
                                duration: 4000
                            });
                            vm.mapIsVisible = false;
                        }
                    }
                    navigator.geolocation.getCurrentPosition(onSuccess, onError, posOptions);
                });
            }
        }

        /**
         * @desc initialize map
         */
        function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
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

            vm.mapIsVisible = true;

            google.maps.event.addDomListener(map, 'click', function(e) {
                var myLatLng = e.latLng;
                var latlng = { lat:  myLatLng.lat(), lng: myLatLng.lng() };
                activityService.getPlaceName(latlng)
                    .then(function(result) {
                        vm.where = result;
                    });
                clickCoordinates = latlng;
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
            var location = { lat:  vm.where.geometry.location.lat(), lng: vm.where.geometry.location.lng() };
            //click coordinates more accurate than geocoded by place coordinates
            var position = (clickCoordinates) ? clickCoordinates : location ;
            vm.activity.location.coordinates = [position.lat, position.lng];
            marker.setPosition(position);
            infoWindow.setContent(vm.where.formatted_address)
            infoWindow.open(map, marker);
            setDistanceFromLastPost(position);
            clickCoordinates = null;
        }

        /**
         * @desc calulate distance from last post and set to vm.activity.props.slMiles
         * @param {Object} position - current coordinates
         */
        function setDistanceFromLastPost(position) {
            var lastActivity = activityService.getLastActivityWithCoord();
            if(lastActivity) {
                var startPos = new google.maps.LatLng(lastActivity.location.coordinates[0], lastActivity.location.coordinates[1]);
                var endPos =  new google.maps.LatLng(position.lat, position.lng);
                activityService.getDistanceBetween(startPos, endPos)
                    .then(function(result) {
                        vm.activity.props.slMiles = result;
                    });
            }
        }

        function saveItemToFeed() {
            $ionicLoading.show({
                template: 'post feed'
            });
            activityService.postActivityToFeed(vm.activity).then(
				function(result) {
            	    $ionicLoading.hide();
            	    console.log(result);
            	    vm.close(result._id);
            });
        }

        function close(str) {
            vm.closeModal(str);
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
