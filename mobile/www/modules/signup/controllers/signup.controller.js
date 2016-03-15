(function() {
    'use strict';

    angular
        .module('signup')
        .controller('SignupCtrl', SignupCtrl);

    SignupCtrl.$inject = ['$ionicHistory', '$q', '$scope', '$state', 'userService'];

    function SignupCtrl($ionicHistory, $q, $scope, $state, UserService) {

        var vm = this;

        vm.goBack = $ionicHistory.goBack;

        vm.itemClass = 'miles-item';
        vm.stepNumber = 5;
        vm.intro = 'How many career miles have&nbsp;you&nbspdriven?';
        vm.nextState = 'signup.years';

        vm.options = [
            { min: 0, max: 100000, title: '100k' },
            { min: 100000, max: 250000, title: '100-250k' },
            { min: 250000, max: 500000, title: '250-500k' },
            { min: 500000, max: 1000000, title: '500k-1M' },
            { min: 1000000, max: 2000000, title: '1-2M' },
            { min: 2000000, max: null, title: '2M' }
        ];

        vm.next = goNext;
        vm.getCurrentStep = initCurrentWizardStep;

        function goNext() {
            return vm.stateAction()
                .then(function(success) {
                    $state.go(vm.nextState, { data: success });
                });
        }

        function initCurrentWizardStep() {
            var cState = $state.current && $state.current.resolve;
            if (cState && _.isFunction(cState.wizard)) {
                vm.wizardState = cState.wizard() || {};
                vm.stepNum = vm.wizardState.stepNum;
                vm.nextState = vm.wizardState.nextState;
                vm.disableBack = Boolean(vm.wizardState.disableBack);
            }

            if (!vm.wizardState.noUser) {
                return UserService.getUserData()
                    .then(function success(userData) {
                        vm.profileData = userData;
                        return userData;
                    });
            }

            return $q.when(null);
        }

        $scope.$on('$ionicView.enter', function(event) {

            var targetCtrl = event.targetScope.vm || {};
            vm.stateAction = targetCtrl.save || $q.when;

            targetCtrl.parentSubmit = goNext;

            initCurrentWizardStep()
                .then(function success (userData) {
                    if (_.isFunction(targetCtrl.activate)) {
                        targetCtrl.activate(userData);
                    }

                    targetCtrl.disableBack = vm.disableBack;
                })
                .then(function disableHistory () {
                    if (vm.disableBack) {
                        // debugger;
                        $ionicHistory.clearHistory();
                        // $ionicHistory.currentView().canSwipeBack = false;
                        // $ionicHistory.currentView().backViewId = null;
                    }
                })
                .catch(function fail (err) {
                    logger.error('initWizardStep failed with error', err);
                });
        });
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('IntroCtrl', IntroCtrl);

    IntroCtrl.$inject = [];

    function IntroCtrl() {

        var vm = this;

        vm.icon = 'app-icon';

        vm.intro = [
            'Welcome to TruckerLine!',
            'In the next few pages, you will be filling in information about yourself and your career',
            'When you are done, you will have a professional resume you can send to anyone you like'
        ];
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('HandleCtrl', HandleCtrl);

    HandleCtrl.$inject = ['userService'];

    function HandleCtrl(UserService) {

        var vm = this;
        vm.intro = ['Welcome to TruckerLine!', 'Let\'s get started with your name and&nbsp;CB&nbsp;Handle :)'];
        vm.labelText = null; //  'class';
        vm.labelPos = 'top';

        vm.options = [
            { min: 'A', title: 'A' },
            { min: 'B', title: 'B' },
            { min: 'C', title: 'C' }
        ];

        vm.save = save;
        vm.submitForm = submitForm;

        function submitForm(event) {
            if (vm.lastElementFocused) {
                _.isFunction(vm.parentSubmit) ? vm.parentSubmit() : save();
            }

            // TODO: Focus Next            
        }

        function save() {

            vm.mainForm.$setSubmitted(true);

            if (!vm.mainForm.$valid) {
                vm.error = vm.error || 'Please correct errors above';
                throw new Error(vm.error);
            }

            var data = vm.user;

            logger.debug('Saving Props for User', data);

            return UserService.updateUserData(data);
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('ClassCtrl', ClassCtrl);

    ClassCtrl.$inject = ['userService'];

    function ClassCtrl(UserService) {

        var vm = this;

        vm.save = save;
        vm.activate = activate;

        vm.itemClass = 'license-class-item';
        vm.intro = 'What class is your driver license?';
        vm.labelText = null; //  'class';
        vm.labelPos = 'top';

        vm.options = [
            { min: 'A', title: 'A' },
            { min: 'B', title: 'B' },
            { min: 'C', title: 'C' }
        ];

        // ////////////////////////////////////////////////////////////////////

        function activate() {
            vm.profileData = UserService.profileData;
            vm.selected = vm.profileData.license && vm.profileData.license.class || null;
        }

        function save() {

            var license = vm.profileData && vm.profileData.license || {};

            license.class = vm.selected;

            var props = {
                license: license
            };

            logger.debug('Saving Props for User', props);

            return UserService.updateUserData(props);
        };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('EndorsementCtrl', EndorsementCtrl);

    EndorsementCtrl.$inject = ['userService'];

    function EndorsementCtrl(UserService) {

        var vm = this;

        vm.save = save;
        vm.activate = activate;

        vm.intro = 'Which endorsements do you have?';
        vm.endorsement = vm.endorsement || {};

        // ////////////////////////////////////////////////////////////////////

        function activate() {
            vm.profileData = UserService.profileData;
            var endorsements = vm.profileData.license && vm.profileData.license.endorsements || [];

            endorsements.map(function(e) { vm.endorsement[e] = true; });
        }

        function save() {

            var license = vm.profileData && vm.profileData.license || {};

            var endorsements = _(vm.endorsement).keys().filter(function(k) { return vm.endorsement[k]; }).value();

            license.endorsements = endorsements;

            var props = {
                license: license
            };

            logger.debug('Saving Props for User', props);

            return UserService.updateUserData(props);
        };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('MilesCtrl', MilesCtrl);

    MilesCtrl.$inject = ['userService'];

    function MilesCtrl(UserService) {

        var vm = this;
        vm.save = save;
        vm.activate = activate;

        vm.itemClass = 'miles-item';
        vm.intro = 'How many career miles have&nbsp;you&nbspdriven?';

        vm.options = [
            { min: 0, max: 100000, title: '100k' },
            { min: 100000, max: 250000, title: '100-250k' },
            { min: 250000, max: 500000, title: '250-500k' },
            { min: 500000, max: 1000000, title: '500k-1M' },
            { min: 1000000, max: 2000000, title: '1-2M' },
            { min: 2000000, max: null, title: '2M' }
        ];

        function activate() {
            var props = UserService.profileData && UserService.profileData.props || {};
            vm.selected = props.miles;
        }

        function save() {
            var props = {
                miles: vm.selected
            };

            logger.debug('Saving Props for User', props);

            return UserService.updateUserProps(props);
        };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('YearsCtrl', YearsCtrl);

    YearsCtrl.$inject = ['userService'];

    function YearsCtrl(UserService) {

        var vm = this;

        vm.save = save;
        vm.activate = activate;

        vm.itemClass = 'years-item';
        vm.intro = 'How many years have you been&nbsp;a&nbsp;truck&nbsp;driver?';
        vm.labelText = 'years';
        vm.labelPos = 'bot';

        vm.options = [
            { min: 0, max: 1, title: '1' },
            { min: 1, max: 3, title: '1-3' },
            { min: 3, max: 5, title: '3-5' },
            { min: 5, max: 10, title: '5-10' },
            { min: 10, max: 15, title: '10-15' },
            { min: 15, max: null, title: '15' }
        ];

        function activate() {
            var props = UserService.profileData && UserService.profileData.props || {};

            if (props.started) {
                var started = moment(props.started, 'YYYY-MM');
                vm.selected = moment().diff(started, 'year');
            }
        }

        function save() {
            var numYears = Number(vm.selected);
            var base = moment([moment().year(), 0, 1]);
            var started = base.subtract(numYears, 'years');

            var props = {
                started: started.format('YYYY-MM')
            };

            logger.debug('Saving Props for User', props);

            return UserService.updateUserProps(props);
        };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('OwnOpCtrl', OwnOpCtrl);

    OwnOpCtrl.$inject = ['userService'];

    function OwnOpCtrl(UserService) {

        var vm = this;

        vm.save = save;
        vm.activate = activate;

        vm.itemClass = 'yes-no-item';
        vm.intro = 'Are you an Owner-Operator?';
        vm.labelText = null;
        vm.labelPos = 'top';
        vm.nextStep = 'signup.trucks';

        vm.options = [
            { min: true, title: 'YES' },
            { min: false, title: 'NO' }
        ];

        function activate() {
            var props = UserService.profileData && UserService.profileData.props || {};
            vm.selected = props.owner;
        }

        function save() {

            var props = {
                owner: vm.selected
            };

            logger.debug('Saving Props for User', props);

            return UserService.updateUserProps(props);
        };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('PhotoCtrl', PhotoCtrl);

    PhotoCtrl.$inject = ['$cordovaGoogleAnalytics', '$q', 'avatarService', 'userService'];

    function PhotoCtrl($ga, $q, avatarService, UserService) {

        var vm = this;

        vm.save = save;
        vm.activate = activate;
        vm.showEditAvatar = showEditAvatar;

        vm.intro = 'Click the button below to upload&nbsp;a&nbsp;profile&nbsp;picture';
        vm.nextStep = 'signup.trucks';

        vm.options = [
            { min: true, title: 'YES' },
            { min: false, title: 'NO' }
        ];

        function activate() {
            vm.profileData = UserService.profileData || {};
            vm.avatar = vm.profileData.profileImageURL;
        }

        /**
         * showEditAvatar
         * --------------
         * Opens an action sheet which leads to either taking
         * a photo, or selecting from device photos.
         */
        function showEditAvatar(parameters) {
            $ga.trackEvent('signup', 'engagement', 'editAvatar');
            var then = Date.now();

            avatarService.getNewAvatar(parameters, vm.profileData)
                .then(function processNewAvatar(avatarResult) {
                    if (_.isEmpty(avatarResult)) {
                        $ga.trackTiming('signup', Date.now() - then, 'engagement', 'newAvatar:cancel');
                        return;
                    }

                    $ga.trackEvent('signup', 'engagement', 'newAvatar');
                    if (vm.avatar !== avatarResult) {
                        vm.avatar = avatarResult;
                    }
                    $ga.trackTiming('signup', Date.now() - then, 'engagement', 'newAvatar:saved');

                });
        }

        function save() {

            var props = {
                avatar: vm.avatar
            };

            return $q.when(props);
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('CompleteCtrl', CompleteCtrl);

    CompleteCtrl.$inject = [];

    function CompleteCtrl() {

        var vm = this;

        vm.intro = [
            'Congratulations!',
            'You are now a TruckerLine driver!'
        ];
    }
})();
