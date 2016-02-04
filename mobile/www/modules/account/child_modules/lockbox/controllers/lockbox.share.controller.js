(function () {
    'use strict';

    angular
        .module('account')
        .controller('LockboxShareCtrl', LockboxShareCtrl);

    LockboxShareCtrl.$inject = ['$filter', '$ionicPopup', 'parameters', 'contactsService', 'lockboxModalsService', 'lockboxDocuments', 'requestService', 'utilsService'];

    function LockboxShareCtrl($filter, $ionicPopup, parameters, contactsService, lockboxModalsService, lockboxDocuments, requestService, utilsService) {

        var vm = this;
        vm.selectedContact = {};
        vm.docsToShare = [];

        vm.back = back;
        vm.cancel = cancel;
        vm.skipDocs = skipDocs;
        vm.documents = getRealDocs(parameters.documents || []);
        vm.addDocumentsToShare = addDocumentsToShare;
        vm.shareDocuments = shareDocuments;

        activate();
        
        ////////////////////////////////////////////////////////////

        function activate() {
            vm.contact = {};
            vm.shareStep = 1;

            return lockboxDocuments.checkAccess({ setNew: false })
                .then(function (isAccessible) {
                    vm.canAccess = isAccessible;

                    if (isAccessible) {
                        
                        if (_.isEmpty(vm.documents)) {
                            logger.debug('Documents not included in parameters - looking up');
                            getDocs();
                        }
                        
                        return;
                    }

                    return skipDocs();
                })
                .catch(function fail(err) {
                    logger.error('Failed to access lockbox due to error', err);
                    vm.canAccess = false;
                });
        }

        function getDocs() {
            return lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    logger.debug('Documents List', response);
                    vm.documents = getRealDocs(_.isArray(response) ? response : []);
                    
                    if (_.isEmpty(vm.documents)) {
                        return skipDocs();
                    }
                });
        }

        function back() {
            vm.shareStep = 1;
        }

        function cancel() {
            var self = this;
            self.shareStep = 1;
            vm.cancelModal(null);
        }
        
        function getRealDocs(source) {
            return _.filter(source, function (src) { return !!src.id; });
        }

        function skipDocs() {
            return addDocumentsToShare(true);
        }

        function addDocumentsToShare(skip) {
            if (!skip) {
                var filter = $filter('getChecked'),
                    selectedDocs = filter(vm.documents);

                vm.docsToShare = selectedDocs;
            } else {
                vm.docsToShare = [];
            }

            vm.shareStep = 2;
        }


        function shareDocuments() {
            var requestObj = {};

            if (!vm.contact || !vm.contact.email) {
                $ionicPopup.alert({ title: 'Error!', template: 'Please, enter recipient information' });
                return;
            }

            requestObj.requestType = 'shareRequest';

            requestObj.text = vm.contact.message || '';
            requestObj.contactInfo = getModifiedContactInfo(vm.contact);
            requestObj.contents = {
                documents: _.pluck(vm.docsToShare, 'id')
            };
            
            var sentRequest = null;

            requestService
                .createRequest(requestObj)
                .then(function (response) {
                    sentRequest = response;
                    return showSuccessPopup(response);
                })
                .then(function () {
                    vm.closeModal(sentRequest);
                })
                .catch(function (err) {
                    logger.error(err, 'Unable to Send Request');
                    $ionicPopup.alert({
                        title: 'Sorry',
                        template: 'Unable to Submit your request right now, please try again later'
                    });
                });

            function getModifiedContactInfo(contact) {
                logger.debug(' contact --->>>', contact);
                if (!contact) return;

                var contactInfo = {};

                angular.copy(contact, contactInfo);

                /**
                 * TODO: Determine 
                 */
                // if(contact.checked) delete contact.checked;
                // if(contact.message) delete contact.message;
                
                if (angular.isDefined(contact.email && (!contact.emails || !contact.emails.length))) {
                    contactInfo.emails = [{ value: contact.email, type: 'manual' }];
                }
                if (angular.isDefined(contact.phone && (!contact.phoneNumbers || !contact.phoneNumbers.length))) {
                    contactInfo.phoneNumbers = [{ value: contact.phone, type: 'manual' }];
                }

                return contactInfo;
            }

            function showSuccessPopup() {
                var config = {},
                    displayName = requestObj.contactInfo.displayName;

                config.title = 'Success!';
                config.template = displayName ? 'Your profile has been shared with ' + displayName : 'Your profile has been shared';

                return $ionicPopup.alert(config);
            }
        }

    }
})();
