(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditTrailersCtrl', ProfileEditTrailersCtrl);

    ProfileEditTrailersCtrl.$inject = ['$scope', 'parameters', 'registerService', 'trailerService', 'userService'];

    function ProfileEditTrailersCtrl($scope, parameters, registerService, trailerService, userService) {
        var vm = this;

        vm.newTrailer = '';
        vm.trailers = getTrailers();

        vm.cancel = cancel;
        vm.save = save;
        vm.addTrailer = trailerService.addTrailer;

        function getTrailers() {
            var trailers = parameters.trailers,
                props = userService.profileData && userService.profileData.props,
                selectedTrailers = props && props.trailer || [],
                trailerNames;

            if (!selectedTrailers.length) return trailers;

            trailerNames = trailers.map(function (trailer) {
                return trailer.name;
            });

            for (var i = 0; i < selectedTrailers.length; i++) {
                var trailer = selectedTrailers[i],
                    trailerExists = trailerNames.indexOf(trailer) >= 0;

                if (!trailerExists) {
                    trailers.push({ name: trailer, checked: true });
                } else {
                    for (var j = 0; j < trailers.length; j++) {
                        var existingTrailer = trailers[j];
                        if (existingTrailer.name === trailer) {
                            existingTrailer.checked = true;
                        }
                    }
                }
            }

            return trailers;
        }

        function cancel() {
            vm.cancelModal();
        }

        function save() {
            var trailers = getNameKeys(vm.trailers);
            registerService.userProps.trailer = trailers;
            return registerService.updateUserProps({ trailer: trailers })
                .then(function (updateResult) {
                    if (updateResult.success) {
                        return vm.closeModal(trailers);
                    }

                    return vm.cancelModal(updateResult.message);
                });
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
