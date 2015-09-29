(function () {
    'use strict';
    
    /**
     * showRequestReviewModal
     * template: modules/account/child_modules/profile/templates/profile-request.html
     */

    angular
        .module('account')
        .controller('ProfileRequestReviewCtrl', ProfileRequestReviewCtrl);

    ProfileRequestReviewCtrl.$inject = ['userService', 'reviewService', 'utilsService', '$ionicLoading'];

    function ProfileRequestReviewCtrl(userService, reviewService, utilsService, $ionicLoading) {
        var vm = this;
        vm.profileData = userService.profileData;
        vm.contact = {};
        vm.message = '';

        vm.sendRequest = sendRequest;
        vm.cancel = cancel;

        function sendRequest() {
            console.log(vm.contact);
            var data = {
                contactInfo: vm.contact,
                text: vm.message,
                requestType: 'reviewRequest'
            }
            var serializedData = utilsService.serialize(data);
            reviewService
                .createRequest(serializedData)
                .then(function (resp) {
                    console.log(resp);
                    if (resp.data) {
                        vm.contact = {};
                        vm.message = '';
                        $ionicLoading.show({ template: 'Success! Your request has been sent', duration: '1500' });
                    }
                })
                .catch(function (resp) {
                    if (resp.data) {
                        $ionicLoading.show({ template: resp.data.message, duration: '1500' });
                    }
                });
        }

        function cancel() {
            vm.closeModal(null);
        }
    }
})();
