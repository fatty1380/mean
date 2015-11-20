(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityAddCtrl', ActivityAddCtrl);

    ActivityAddCtrl.$inject = ['$scope', 'activityService', 'parameters', '$filter', 'LoadingService', '$ionicPopup', '$ionicPlatform'];

    function ActivityAddCtrl($scope, activityService, parameters, $filter, LoadingService, $ionicPopup, $ionicPlatform) {
        angular.element(document).ready(
            getCurrentPosition
            );

        var vm = this;
        var myCoordinates = null;
        var clickCoordinates = null;
        var map = null;
        var marker = null;
        var infoWindow = null;
        var user = parameters.user;

        logger.warn(' user --->>>', user);

        vm.activity = {
            title: '',
            notes: '',
            location: {
                placeName: '',
                placeId: '',
                type: 'Point',
                coordinates: [],
                created: ''
            },
            props: {
                avatar: user.profileImageURL,  /// TODO: WRONG - Use Cache Service
                handle: user.handle,        /// WRONG
                freight: '',
                slMiles: ''
            },
            created: Date.now()
        };

        vm.saveItemToFeed = saveItemToFeed;
        vm.close = close;
        vm.mapIsVisible = true;

        $scope.$watch('vm.where', function () {
            if (vm.where) {
                vm.activity.location.placeName = vm.where.formatted_address;
                vm.activity.location.placeId = vm.where.place_id;
                setMarkerPosition();
            }
        }, true);

        /**
         * @desc geocode current position
         */
        function getCurrentPosition() {
            if (navigator.geolocation) {
                $ionicPlatform.ready(function () {
                    LoadingService.showLoader('Checking 20');
                    var posOptions = { timeout: 10000, enableHighAccuracy: false };

                    var onSuccess = function (position) {
                        logger.debug('*** sucess ***');
                        LoadingService.hide();
                        var lat = position.coords.latitude;
                        var long = position.coords.longitude;
                        myCoordinates = new google.maps.LatLng(lat, long);
                        vm.activity.location.coordinates = [lat, long];
                        logger.debug(LoadingService);
                        initMap();
                    };
                    function onError(error) {
                        logger.debug('*** error ***');
                        LoadingService.hide();
                        //show only 1 error message
                        if (vm.mapIsVisible) {
                            LoadingService.showAlert('10-7', { duration: 1000 });
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
                draggable: true,
                zoomControl: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            marker = new google.maps.Marker({
                position: myCoordinates,
                title: 'Point A',
                map: map,
                draggable: false
            });

            vm.mapIsVisible = true;

            google.maps.event.addDomListener(map, 'click', function (e) {
                var myLatLng = e.latLng;
                var latlng = { lat: myLatLng.lat(), lng: myLatLng.lng() };
                activityService.getPlaceName(latlng)
                    .then(function (result) {
                        vm.where = result;
                    });
                clickCoordinates = latlng;
            });

            infoWindow = new google.maps.InfoWindow({
                content: ''
            });

            //get location name after init
            activityService.getPlaceName(myCoordinates)
                .then(function (result) {
                    vm.where = result;
                });
        }

        /**
         * @desc set marker position
         */
        function setMarkerPosition() {
            var location = { lat: vm.where.geometry.location.lat(), lng: vm.where.geometry.location.lng() };
            //click coordinates more accurate than geocoded by place coordinates
            var position = (clickCoordinates) ? clickCoordinates : location;
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
            if (lastActivity) {
                var startPos = new google.maps.LatLng(lastActivity.location.coordinates[0], lastActivity.location.coordinates[1]);
                var endPos = new google.maps.LatLng(position.lat, position.lng);
                activityService.getSLDistanceBetween(startPos, endPos)
                    .then(function (result) {
                        vm.activity.props.slMiles = result;
                    });
            }
        }

        function saveItemToFeed() {
            if (!vm.activity.title) {
                LoadingService.showAlert('Please enter a title for your activity');
                return;
            }

            LoadingService.showLoader('Saving')

            logger.warn('posting vm.activity --->>>', vm.activity);

            activityService.postActivityToFeed(vm.activity)
                .then(function (result) {
                    LoadingService.hide();
                    logger.debug(result);
                    vm.closeModal(result);
                })
                .catch(function (err) {
                    logger.error('Posting Activity Failed', err);
                    LoadingService.showAlert('Unable to checkin, try again later');
                });
        }

        function close(str) {
            vm.cancelModal(str);
        }
    }
})();
