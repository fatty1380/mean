(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditTrailersCtrl', ProfileEditTrailersCtrl);

    ProfileEditTrailersCtrl.$inject = ['$scope', 'parameters', 'registerService'];

    function ProfileEditTrailersCtrl($scope, parameters, registerService) {
        var vm = this;

        vm.newTrailer = '';
        vm.trailers = parameters.trailers;

        vm.cancel = cancel;
        vm.save = save;


        function cancel () {
            $scope.closeModal();
        }

        function save () {
            registerService.setProps('trailer', getNameKeys(vm.trailers));
            registerService.updateUser(registerService.getDataProps());

            cancel();
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
