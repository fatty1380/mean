(function() {
    'use strict';

    angular
        .module('signup')
        .controller('SignupCtrl', SignupCtrl);

    SignupCtrl.$inject = ['$ionicHistory', 'NavSvc'];

    function SignupCtrl($ionicHistory, NavSvc) {

        var vm = this;

        vm.goBack = $ionicHistory.goBack;

        vm.itemClass = 'miles-item';
        vm.stepNumber = 5;
        vm.intro = 'How many career miles have&nbsp;you&nbspdriven?';
        vm.nextStep = 'signup.years';

        vm.options = [
            { min: 0, max: 100000, title: '100k' },
            { min: 100000, max: 250000, title: '100-250k' },
            { min: 250000, max: 500000, title: '250-500k' },
            { min: 500000, max: 1000000, title: '500k-1M' },
            { min: 1000000, max: 2000000, title: '1-2M' },
            { min: 2000000, max: null, title: '2M' }
        ];

        vm.next = function() { NavSvc.go(vm.nextStep); };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('MilesCtrl', MilesCtrl);

    MilesCtrl.$inject = ['NavSvc'];

    function MilesCtrl(NavSvc) {

        var vm = this;
        vm.itemClass = 'miles-item';
        vm.stepNumber = 5;
        vm.intro = 'How many career miles have&nbsp;you&nbspdriven?';
        vm.nextStep = 'signup.years';

        vm.options = [
            { min: 0, max: 100000, title: '100k' },
            { min: 100000, max: 250000, title: '100-250k' },
            { min: 250000, max: 500000, title: '250-500k' },
            { min: 500000, max: 1000000, title: '500k-1M' },
            { min: 1000000, max: 2000000, title: '1-2M' },
            { min: 2000000, max: null, title: '2M' }
        ];

        vm.next = function() { NavSvc.go(vm.nextStep); };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('YearsCtrl', YearsCtrl);

    YearsCtrl.$inject = ['NavSvc'];

    function YearsCtrl(NavSvc) {

        var vm = this;
        vm.itemClass = 'years-item';
        vm.stepNumber = 6;
        vm.intro = 'How many years have you been&nbsp;a&nbsp;truck&nbsp;driver?';
        vm.labelText = 'years';
        vm.labelPos = 'bot';
        vm.nextStep = 'signup.own-op';

        vm.options = [
            { min: 0, max: 1, title: '1' },
            { min: 1, max: 3, title: '1-3' },
            { min: 3, max: 5, title: '3-5' },
            { min: 5, max: 10, title: '5-10' },
            { min: 10, max: 15, title: '10-15' },
            { min: 15, max: null, title: '15' }
        ];

        vm.next = function() { NavSvc.go(vm.nextStep); };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('ClassCtrl', ClassCtrl);

    ClassCtrl.$inject = ['NavSvc'];

    function ClassCtrl(NavSvc) {

        var vm = this;
        vm.itemClass = 'license-class-item';
        vm.stepNumber = 3;
        vm.intro = 'What class is your driver license?';
        vm.labelText = null; //  'class';
        vm.labelPos = 'top';
        vm.nextStep = 'signup.endorsements';

        vm.options = [
            { min: 'A', title: 'A' },
            { min: 'B', title: 'B' },
            { min: 'C', title: 'C' }
        ];

        vm.next = function() { NavSvc.go(vm.nextStep); };
    }
})();

(function() {
    'use strict';

    angular
        .module('signup')
        .controller('OwnOpCtrl', OwnOpCtrl);

    OwnOpCtrl.$inject = ['NavSvc'];

    function OwnOpCtrl(NavSvc) {

        var vm = this;
        vm.itemClass = 'yes-no-item';
        vm.stepNumber = 7;
        vm.intro = 'Are you an Owner-Operator?';
        vm.labelText = null;
        vm.labelPos = 'top';
        vm.nextStep = 'signup.trucks';

        vm.options = [
            { min: true, title: 'YES' },
            { min: false, title: 'NO' }
        ];

        vm.next = function() { NavSvc.go(vm.nextStep); };
    }
})();


(function() {
    'use strict';

    angular
        .module('signup')
        .service('NavSvc', NavSvc);

    NavSvc.$inject = ['$state'];

    function NavSvc($state) {

        var vm = this;

        vm.go = function goNext(stateName, params) {
            $state.go(stateName, params);
        };

        return this;
    }
})();
