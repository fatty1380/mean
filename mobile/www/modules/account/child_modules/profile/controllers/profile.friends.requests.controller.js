(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileFriendRequestCtrl', ProfileFriendRequestCtrl);

    ProfileFriendRequestCtrl.$inject = ['$scope', 'friendsService', 'parameters'];

    function ProfileFriendRequestCtrl($scope, friendsService, parameters) {
        var vm = this;

        vm.requests = parameters || [];

        vm.cancel = cancel;
        vm.handleRequest = handleRequest;

        function handleRequest(request, action) {
            var data = { action: action},
                index = vm.requests.indexOf(request);

            friendsService
                .updateRequest(request.id, data)
                .then(function (updatingRequest) {
                    if(index >= 0) vm.requests.splice(index);
                    console.warn(' updatingRequest --->>>', updatingRequest);
                });
        }


        function cancel() {
            $scope.closeModal(null);
        }

    }

})();
