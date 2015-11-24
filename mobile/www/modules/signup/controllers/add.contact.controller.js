(function () {
    'use strict';

    angular
        .module('signup')
        .controller('AddContactFriendsCtrl', AddContactFriendsCtrl);

    AddContactFriendsCtrl.$inject = ['contacts', '$state', '$q', '$cordovaGoogleAnalytics', '$ionicPopup', '$http',
        'registerService', 'settings', 'utilsService', 'LoadingService', 'contactsService', '$filter'];

    function AddContactFriendsCtrl(contacts, $state, $q, $cordovaGoogleAnalytics, $ionicPopup, $http,
        registerService, settings, utilsService, LoadingService, contactsService, $filter) {
        var vm = this;

        debugger;
        vm.contacts = contacts || contactsService.getContacts();
        vm.contactsResolved = contactsService.isResolved();

        vm.skip = skip;
        vm.back = goBack;
        vm.loadContacts = loadContacts;
        vm.sendInvitations = sendInvitations;
        
        ///////////////////////////////////////////////////////////////////

        function skip() {
            $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'skip');
            $state.go('account.profile');
        }

        function goBack() {
            $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'gotBack');
            return $state.go('signup-friends');
        }

        function loadContacts() {
            var then = Date.now();
            return contactsService.resolveContacts()
                .then(function (resolvedContacts) {
                    debugger;
                    vm.contacts = resolvedContacts; // contactsService.getContacts();
                    vm.contactsResolved = contactsService.isResolved();

                    $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'loadContacts', Date.now() - then);
                })
                .finally(LoadingService.hide);
        }

        function sendInvitations() {
            var filter = $filter('getChecked');
            var selectedContacts = filter(vm.contacts, { clearChecked: false });

            if (!selectedContacts.length) {
                LoadingService.showFailure('Please select at least one contact to invite');
                $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites.none');
                return;
            }

            var then = Date.now();

            $ionicPopup.confirm({
                title: 'TruckerLine Invites',
                template: 'Invite ' + selectedContacts.length + ' selected contacts?'
            })
                .then(function (res) {
                    if (res) {
                        LoadingService.showLoader('Sending Invitations');
                        // TODO: COMBINE w/ profile.add.friends.controller
                        //return friendsService.sendRequests(selectedContacts);

                        ///////
                        var reqs = [];
                        for (var i = 0; i < selectedContacts.length; i++) {
                            logger.warn('selectedContacts --->>>', selectedContacts);
                            var hasHashKey = selectedContacts[i].$$hashKey;
                            if (hasHashKey) {
                                delete selectedContacts[i].$$hashKey;
                            }

                            var postData = { contactInfo: selectedContacts[i], text: '' };

                            var r = $http
                                .post(settings.requests, postData)
                                .then(function (resp) {
                                    logger.info('Send Request Success resp --->>>', resp);

                                }, function (err) {
                                    logger.error('Send request err --->>>', err);
                                });

                            reqs.push(r);
                        }

                        return $q.all(reqs);

                    } else {
                        logger.debug('friends are not invited');
                        return $q.reject('cancel');
                    }
                })
                .then(function (sentRequests) {

                    logger.debug('Sent ' + sentRequests.length + ' requests');
                    LoadingService.showSuccess('Invitations Sent');

                    $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites', Date.now() - then);

                    $state.go('account.profile');
                })
                .catch(function (err) {

                    if (/cancel/i.test(err)) {

                        $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites.cancel');
                        logger.debug('user cancelled');
                        return;
                    }

                    logger.error('Unable to invite friends:', err);

                    $ionicPopup
                        .confirm({
                            title: 'Sorry',
                            template: 'Failed to send invites. Try again?'
                        })
                        .then(function (res) {

                            if (res) {
                                $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites.retry');
                                return sendInvitations();
                            }

                            $cordovaGoogleAnalytics.trackEvent('signup', 'addContacts', 'sendInvites.giveUp');
                            $state.go('account.profile');
                        });

                });
        }
    }
})();
