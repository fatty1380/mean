(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope','activityService', '$ionicLoading', '$cordovaGeolocation', '$ionicPlatform'];

    function ActivityAddCtrl($scope, activityService, $ionicLoading, $cordovaGeolocation, $ionicPlatform) {
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

        $scope.$watch('vm.where', function() {
            if(vm.where) {
                setMarkerPosition();
            }
        }, true);

        /**
         * @desc geocode current position
         */
        function getCurrentPosition() {
            console.log(' ');
            console.log('getCurrentPosition()');

            $ionicPlatform.ready(function() {
                console.log('!!!!!!   $ionicPlatform');
                $ionicLoading.show({
                    template: 'geocoding position'
                });
                var posOptions = {timeout: 10000, enableHighAccuracy: false};
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function (position) {
                        console.log("*** sucess ***");
                        $ionicLoading.hide();
                        var lat = position.coords.latitude;
                        var long = position.coords.longitude;
                        myCoordinates = new google.maps.LatLng(lat, long);
                        vm.activity.location.coordinates = [lat, long];
                        console.log($ionicLoading);
                        initMap();
                    }, function (err) {
                        console.log("*** error ***");
                        console.log(err);
                        $ionicLoading.hide();
                        console.log($ionicLoading);
                        activityService.showPopup('Geocoder failed', err);
                        initMap();
                    });
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
            var location = { lat:  vm.where.geometry.location.G, lng: vm.where.geometry.location.K };

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
            console.log('setDistanceFromLastPost()');
            var lastActivity = activityService.getLastFeedActivity();
            console.log('lastCoord ',lastActivity);
            if(activityService.hasCoordinates(lastActivity)) {
                var startPos = new google.maps.LatLng(lastActivity.location.coordinates[0], lastActivity.location.coordinates[1]);
                var endPos =  new google.maps.LatLng(position.lat, position.lng);
                activityService.getDistanceBetween(startPos, endPos)
                    .then(function(result) {
                        vm.activity.props.slMiles = result;
                    });
            }
        }

        function saveItemToFeed() {
            console.log('vm.activity ',vm.activity.location.coordinates);
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
