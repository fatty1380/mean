(function () {
    'use strict';

    angular.module('signup').directive('accessibleForm', function () {
        return {
            restrict: 'A',
            link: function (scope, elem) {

                // set up event handler on the form element
                elem.on('submit', function () {

                    // find the first invalid element
                    var firstInvalid = elem[0].querySelector('.ng-invalid');

                    // if we find one, set focus
                    if (firstInvalid) {
                        firstInvalid.focus();
                    }
                });
            }
        };
    });

    angular
        .module('signup')
        .controller('LoginCtrl', LoginCtrl);

    LoginCtrl.$inject = ['$state', 'lockboxDocuments', '$window', 'registerService', '$ionicLoading', 'tokenService', 'userService', 'securityService'];

    function LoginCtrl($state, lockboxDocuments, $window, registerService, $ionicLoading, tokenService, userService, securityService) {
        var vm = this;
        vm.lastElementFocused = false;

        vm.error = '';
        vm.user = {
            email: '',
            password: ''
        };

        vm.signIn = signIn;
        vm.submitForm = submitForm;

        vm.echange = function () {
            vm.error = '';
            //console.warn(' vm.user --->>>', vm.user.email);
        };
        /**
         * @description Submit form if last field in focus
        */
        function submitForm() {
            vm.error = '';
            vm.mainLoginForm.$submitted = true;
            if (vm.lastElementFocused) {
                signIn();
            }
        }

        /**
         * @description
         * Sign In
         */
        function signIn() {

            if (vm.mainLoginForm.$invalid) {
                return;
            }

            $ionicLoading.show({
                template: 'please wait'
            });
            tokenService.set('access_token', '');

            registerService.signIn(vm.user)
                .then(function (response) {
                    $ionicLoading.hide();
                    var data = response && response.message && response.message.data;
                    if (response.success && !!data) {
                        tokenService.set('access_token', data.access_token);
                        tokenService.set('refresh_token', data.refresh_token);
                        tokenService.set('token_type', data.token_type);

                        registerService
                            .me()
                            .then(function (profileData) {
                                if (profileData.success) {
                                    userService.profileData = profileData.message.data;
                                    securityService.initialize();

                                    removePrevUserDocuments(profileData.message.data.id);

                                    $state.go('account.profile');
                                }
                            });

                        vm.error = '';
                    } else {
                        var status = response.message && response.message.status;
                        if (_.includes([401, 403], status)) {
                            vm.error = 'Please double-check email and password';
                        } else {
                            vm.error = 'Unable to authenticate. Please try again later';
                        }

                        selectInputValue('password');
                    }
                });
        }

        function removePrevUserDocuments (id) {
            var storage = $window.localStorage;
            var usersJSON = storage.getItem('hasDocumentsForUsers');
            var users = usersJSON && JSON.parse(usersJSON);

            if(!users || !(users instanceof Array) || !users.length) return;

            angular.forEach(users, function (user) {
                if(user !== id){
                    console.warn('removing documents for user --->>>', user);
                    return lockboxDocuments.removeDocumentsByUser(user);
                }
            });

            console.warn('Documents users >>>', users);
            storage.setItem('hasDocumentsForUsers', JSON.stringify(users));
        }

        function selectInputValue(id) {
            var password = document.getElementById(id);
            password.setSelectionRange(0, password.value.length);
        }

        //$scope.$on('$ionicView.afterEnter', function () {
        //    // Handle iOS-specific issue with jumpy viewport when interacting with input fields.
        //    if (window.cordova && window.cordova.plugins.Keyboard) {
        //        window.cordova.plugins.Keyboard.disableScroll(true);
        //    }
        //});
        //$scope.$on('$ionicView.beforeLeave', function () {
        //    if (window.cordova && window.cordova.plugins.Keyboard) {
        //        // return to keyboard default scroll state
        //        window.cordova.plugins.Keyboard.disableScroll(false);
        //    }
        //});
    }
})();



