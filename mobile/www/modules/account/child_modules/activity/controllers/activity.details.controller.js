(function () {
    'use strict';

    angular
        .module('activity')
        .controller('ActivityDetailsCtrl', ActivityDetailsCtrl);

    ActivityDetailsCtrl.$inject = ['parameters', 'activityService', '$state', '$timeout', '$ionicScrollDelegate'];

    function ActivityDetailsCtrl(parameters, activityService, $state, $timeout, $ionicScrollDelegate) {
        angular.element(document).ready(initMap);

        var vm = this;
        var map = null;
        var marker = null;

        vm.distanceSinceLastPost = 'no data';
        vm.isInputVisible = false;
        vm.entry = parameters.entry;

        vm.close = close;
        vm.viewUser = viewUser;
        vm.likeActivity = likeActivity;
        vm.toggleInput = toggleInput;
        vm.createComment = createComment;

        return activate();
        
        /////////////////////////////////////////////////////////////
        
        function activate() {
            if (_.isEmpty(vm.entry)) {
                console.error('No Activity has been loaded into the Controller', parameters);

                return vm.close();
            }

            vm.user = parameters.user || vm.entry.user;
            vm.avatar = activityService.getAvatar(vm.entry);
        }

        function initMap() {
            if (activityService.hasCoordinates(vm.entry)) {
                var latLng = new google.maps.LatLng(vm.entry.location.coordinates[0], vm.entry.location.coordinates[1]);
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 8,
                    center: latLng,
                    draggable: true,
                    sensor: true,
                    zoomControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    draggable: false
                });

                activityService.getPlaceName(latLng).then(
                    function (result) {
                        var infoWindow = new google.maps.InfoWindow({
                            content: result.formatted_address
                        });
                        infoWindow.setContent(result.formatted_address);
                        infoWindow.open(map, marker);
                    }, function () {
                        console.log('getPlaceName error');
                    });
            }
        }

        function scrollToBottom() {
            $timeout(function () {
                getDelegate('mainScroll').scrollBottom();
            }, 100);
        }

        //fix for scrollDelegate in modals
        function getDelegate(name) {
            var instances = $ionicScrollDelegate.$getByHandle(name)._instances;
            return instances.filter(function (element) {
                return (element['$$delegateHandle'] == name);
            })[0];
        }

        function createComment(event) {
            
            if (_.isEmpty(vm.message)) {
                return;
            }

            var data = {
                text: vm.message
            };

            vm.message = '';
            vm.isInputVisible = false;

            activityService
                .postComment(vm.entry.id, data)
                .then(
                    function (result) {
                        console.log('result ', result);
                        if (result.data) {
                            vm.entry.comments = result.data;
                            scrollToBottom();
                        }
                    }, function (resp) {
                        console.log(resp);
                    });
        }

        function toggleInput(event, direction) {
            vm.isInputVisible = _.isUndefined(direction) ? !vm.isInputVisible : !!direction;
            
            if (!!vm.isInputVisible) { vm.focusComment = true; }
        }
        
        function viewUser() {
            event.stopPropagation();
            
            $state.go('account.profile', { userId: vm.entry.user.id });
            vm.closeModal(vm.entry);
        }

        function likeActivity() {
            activityService
                .likeActivity(vm.entry.id)
                .then(function (result) {
                    //update like in feed
                    vm.entry.likes = result || [];
                }, function (resp) {
                    console.log(resp);
                });
        }

        function close() {
            vm.closeModal(vm.entry);
        }
    }
})();

angular.module('activity').directive('focusMe', function($timeout) {
  return {
    scope: { trigger: '=focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) { 
          //console.log('trigger',value);
          $timeout(function() {
            element[0].focus();
            scope.trigger = false;
          }, 100);
        }
      });
    }
  };
});