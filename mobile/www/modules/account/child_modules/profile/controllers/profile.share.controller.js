(function() {
    'use strict';

    angular
        .module('account')
        .controller('ProfileShareCtrl', ProfileShareCtrl);

    ProfileShareCtrl.$inject = ['$scope', 'lockboxDocuments', 'userService'];

    function ProfileShareCtrl($scope, lockboxDocuments, userService) {
        var vm = this;

        vm.profileData = userService.profileData;
        vm.documents = lockboxDocuments.getDocuments();


        function getDocs () {
            lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);

                    vm.documents = response.data instanceof Array && response.data.length ? response.data : lockboxDocuments.getStubDocuments();
                })
        }

        getDocs();

        vm.shareStep = 1;

        vm.close = function () {
            $scope.closeModal(null)
        }
    }

})();
