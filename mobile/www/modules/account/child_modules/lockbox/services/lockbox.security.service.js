angular
    .module('lockbox')
    .factory('lockboxSecurity', lockboxSecurity);

lockboxSecurity.$inject = ['$rootScope', '$state', '$ionicPopup', 'LoadingService', '$q', '$timeout', '$cordovaGoogleAnalytics', 'securityService'];
function lockboxSecurity ($rootScope, $state, $ionicPopup, LoadingService, $q, $timeout, $cordovaGoogleAnalytics, securityService) {

    return {
        checkAccess: checkAccess,
        getUnlockedStatus: getCurrentStatus
    };

    function getCurrentStatus () {
        return securityService
            .getPin()
            .then(function (pin) {
                if (_.isEmpty(pin)) {
                    return true;
                }

                var state = securityService.getState();

                return !state.secured;
            });
    }

    function checkAccess (options) {
        // TODO: refactor and move to service
        // Step 1: Pulled out into standalone function

        options = _.defaults({}, options, {
            setNew: true
        });

        var $scope = $rootScope.$new();

        $scope.data = {
            title: 'Enter New PIN',
            subTitle: 'Secure your Lockbox with a 4 digit PIN'
        };

        var scopeData = $scope.data;
        var state = securityService.getState();
        var PIN;

        var pinPopup;
        scopeData.closePopup = closePINPopup;
        scopeData.pinChange = pinChanged;

        // ////////////////////////////////////////////

        // return $q.when(true);

        // ///////////////////////////////////////////

        return securityService
            .getPin()
            .then(function (pin) {
                PIN = pin;
                state = securityService.getState();

                // If the lockbox has a PIN and is Locked
                if (state.secured) {
                    scopeData.title = 'Enter PIN';
                    scopeData.subTitle = 'Enter your PIN to unlock';
                }
                // If the lockbox has NO PIN set and we are not setting a new PIN, reject
                else if (!state.secured && !options.setNew) {
                    return $q.reject('Lockbox not secured and securing is disabled');
                }

            })
            .then(function () {
                
                if (!state.accessible) {
                    LoadingService.hide();
                    $cordovaGoogleAnalytics.trackEvent('Lockbox', 'open', 'locked');
                    return pinPopup = $ionicPopup.show(getPinObject());
                }

                $cordovaGoogleAnalytics.trackEvent('Lockbox', 'open', 'unlocked');
                return state.accessible;
            })
            .then(function (accessGranted) {
                if (!accessGranted) {
                    $cordovaGoogleAnalytics.trackEvent('Lockbox', 'open', 'no-access');
                    if (options.throwOnFail) {
                        throw new Error('Lockbox Authentication Failed');
                    }
                }

                return !!accessGranted;
            })
            .catch(function (error) {
                if (options.throwOnFail) {
                    throw error;
                }
                return -1;
            })
            .finally(function () {
                LoadingService.hide();
            });

        function getPinObject () {
            return {
                template: '<input class="pin-input" type="tel" ng-model="data.pin" ng-change="data.pinChange(this)" maxlength="4" autofocus>',
                title: scopeData.title,
                subTitle: scopeData.subTitle,
                scope: $scope,
                buttons: [
                    { text: 'Cancel', type: 'button-small' }
                ]
            };
        }

        function closePINPopup (data) {
            pinPopup.close(data);
        }

        function pinChanged (popup) {
            if (scopeData.pin.length !== 4) {return;}

            if (!scopeData.confirm && !state.secured) {
                // Creating New PIN on Confirmation Step
                scopeData.confirm = true;
                scopeData.newPin = scopeData.pin;
                scopeData.pin = '';
                popup.subTitle = 'Please confirm your PIN';
                popup.title = 'Confirm New PIN';

                $cordovaGoogleAnalytics.trackEvent('Lockbox', 'secure', 'init');

            } else if (state.secured && PIN && (scopeData.pin === PIN)) {
                // Successfully unlocked Lockbox
                scopeData.closePopup(securityService.unlock(scopeData.pin));

                $cordovaGoogleAnalytics.trackEvent('Lockbox', 'unlock', 'success');
                LoadingService.showIcon('Unlocked', 'ion-unlocked');
            } else if (state.secured && PIN && scopeData.pin != PIN) {
                // Incorrect PIN Number
                $cordovaGoogleAnalytics.trackEvent('Lockbox', 'unlock', 'invalid');
                scopeData.pin = '';
            } else if (scopeData.confirm && !state.secured) {
                if (scopeData.pin === scopeData.newPin) {
                    // Set new PIN
                    securityService.setPin(scopeData.pin);
                    scopeData.closePopup(securityService.unlock(scopeData.pin));

                    $cordovaGoogleAnalytics.trackEvent('Lockbox', 'secure', 'confirmed');

                    LoadingService.showIcon('Documents Secured', 'ion-locked');
                } else {
                    // New PIN confirmation failed
                    scopeData.confirm = false;
                    scopeData.pin = '';

                    delete scopeData.newPin;

                    $cordovaGoogleAnalytics.trackEvent('Lockbox', 'secure', 'invalid');

                    popup.subTitle = 'Secure your Lockbox with a 4 digit PIN';
                    popup.title = 'Confirmation Failed';
                }
            }
        }
    }
}
