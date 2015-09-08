(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditTrailersCtrl', ProfileEditTrailersCtrl);

    ProfileEditTrailersCtrl.$inject = ['$scope', 'parameters', 'registerService', 'trailerService'];

    function ProfileEditTrailersCtrl($scope, parameters, registerService, trailerService) {
        var vm = this;

        vm.newTrailer = '';
        vm.trailers = parameters.trailers;

        vm.cancel = cancel;
        vm.save = save;
        vm.addTrailer = trailerService.addTrailer;


        function cancel (trailers) {
            $scope.closeModal(trailers);
        }

        function save () {
            var trailers = getNameKeys(vm.trailers);
            registerService.setProps('trailer', trailers);
            registerService.updateUser(registerService.getDataProps());

            cancel(trailers);
        }

        function getNameKeys(obj) {
            var keys = [];
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (obj[i].checked) {
                        keys.push(obj[i].name);
                    }
                }
            }
            return keys;
        }


        //vm.addTrailer = addTrailer;
        //vm.trailers = getTrailers();

    }

})();
