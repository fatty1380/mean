(function() {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope', 'activityService', '$filter', '$ionicLoading', '$ionicPopup', '$ionicPlatform'];

    function ActivityAddCtrl($scope, activityService, $filter, $ionicLoading, $ionicPopup, $ionicPlatform) {
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
            notes : 'Enter notes about your drive',
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
            },
            created: Date.now()
        }

        vm.saveItemToFeed = saveItemToFeed;
        vm.close = close;
        vm.addNotes= addNotes;
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
                activityService.getSLDistanceBetween(startPos, endPos)
                    .then(function(result) {
                        vm.activity.props.slMiles = result;
                    });
            }
        }

        function saveItemToFeed() {
            if(!vm.activity.title){
                $ionicPopup.alert({
                    title: 'Title is empty.',
                    template: 'Please, enter title before posting an activity.'
                });
                return;
            }

            $ionicLoading.show({
                template: 'post feed'
            });

            activityService.postActivityToFeed(vm.activity).then(
				function(result) {
            	    $ionicLoading.hide();
            	    console.log(result);
            	    vm.close(result);
            });
        }

        function close(str) {
            vm.closeModal(str);
        }

        function addNotes () {
            var notes = vm.activity.notes;

            $scope.data = {};

            if(notes !== 'Enter notes about your drive'){
                $scope.data.notes = notes;
            }

            var notesPopup = $ionicPopup.show({
                template: '<textarea ng-model="data.notes" style="height: 125px; font-size: 16px; line-height: 18px; color: #9b9b9b;" autofocus></textarea>',
                title: 'Enter notes about your drive',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.notes) {
                                return 'Enter notes about your drive';
                            } else {
                                return $scope.data.notes;
                            }
                        }
                    }
                ]
            });

            notesPopup.then(function(res) {
                if(res) vm.activity.notes = res;
            });

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
