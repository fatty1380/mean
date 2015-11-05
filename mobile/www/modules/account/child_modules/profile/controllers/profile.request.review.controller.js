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
            };
            
            if (_.isEmpty(vm.contact) || _.isEmpty(vm.contact.email) && _.isEmpty(vm.contact.phone)) {
                $ionicLoading.show({ template: 'Please enter an email address', duration: '2000' });
                return;
            }
            
            reviewService
                .createRequest(data)
                .then(function (resp) {
                    console.log(resp);
                    if (resp.data) {
                        vm.contact = {};
                        vm.message = '';
                        $ionicLoading.show({ template: 'Success! Your request has been sent', duration: '1500' });
                    }
                    
                    return vm.closeModal(resp.data);
                })
                .catch(function (resp) {
                    if (resp.data) {
                        $ionicLoading.show({ template: 'Unable to Request at this time. <br>Please try again later', duration: '1500' });
                    }
                });
        }

        function cancel() {
            vm.cancel();
        }
    }
})();
