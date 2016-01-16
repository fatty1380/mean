(function () {
    'use strict';

    angular
        .module('account')
        .controller('ProfileEditAddressCtrl', ProfileEditAddressCtrl);

    ProfileEditAddressCtrl.$inject = ['parameters', 'userService', 'LoadingService'];

    function ProfileEditAddressCtrl(parameters, userService, Loader) {
        var vm = this;
        
        vm.address = parameters.address;
        vm.addresses = parameters.addresses;

        vm.save = save;
        vm.addAddress = addAddress;
        vm.isValid = isValid;
        
        function addAddress() {
            logger.error('addAddress is not implemented');
        }

        function save() {
            
            Loader.showLoader('Saving Address');
            
            var postData = _.isEmpty(vm.addresses) ? { address: vm.address } : { addresses: [vm.address] };
            
            userService.updateUserData(postData)
                .then(function success(result) {
                    debugger;
                    Loader.hide();
                    logger.info('Updated User with new address');
                    
                    vm.address = result.address;
                    vm.addresses = result.addresses;
                    
                    return vm.closeModal({ address: result.address, addresses: result.addresses });
                })
                .catch(function error(err) {
                    LoadingService.showFailure('Sorry, an error occured');
                    logger.err('Saving address failed', err);
                });
        
        }
        
        function isValid() {
            if (_.isEmpty(vm.address.streetAddresses) ||
                vm.address.streetAddresses.join('').trim().length < 5) {
                return false;
            }
            
            if (_.isEmpty(vm.address.zipCode) ||
                (_.isEmpty(vm.address.city) &&
            _.isEmpty(vm.address.state))) {
                return false;
            }
            
            return true;
        }

    }

})();
