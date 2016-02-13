'use strict';

(function () {
    // Profile Controller Spec
    describe('ProfileCtrl', function () {
        // Initialize global variables
        var ProfileCtrl,
            $httpBackend;

        var testUser = {
            __v: 0,
            _id: '55a5317e4cec3d4a40d4bfa9',
            addresses: [],
            company: null,
            created: '2015-07-14T15:57:50.097Z',
            displayName: 'sergey markov',
            driver: '55a5317e4cec3d4a40d4bfaa',
            email: 'markov.flash@gmail.com',
            firstName: 'sergey',
            friends: [],
            handle: 'some handle',
            id: '55a5317e4cec3d4a40d4bfa9',
            isAdmin: false,
            isDriver: false,
            isOwner: false,
            lastName: 'markov',
            modified: '2015-09-07T14:00:45.994Z',
            oldPass: false,
            password: 'IS/7ky+J7Zu+oc2y8RzOXQzXYcqZmNT3qU45ekmIBCrj3TnCDdbcliYWkYjrJnoc+03JDHAyyQ86rQVFQtjjiw==',
            phone: '',
            profileImageURL: 'modules/users/img/profile/default.png',
            provider: 'local',
            requests:[],
            roles: ['user'],
            salt: 'URfgM0ouhG+nJoSisgQTAw==',
            shortName: 'sergeym',
            type: 'driver',
            username: 'markov.flash@gmail.com'
        };

        // Then we can start by loading the main application module
        beforeEach(module(AppConfig.appModuleName));

        beforeEach(inject(function ($injector) {
            var $controller = $injector.get('$controller');
            $httpBackend = $injector.get('$httpBackend');
        }));

        // Create
        beforeEach(inject(function ($rootScope, $controller) {
            // Initialize the ProfileCtrl controller.
            var scope = $rootScope.$new();
            ProfileCtrl = $controller('ProfileCtrl', {
                $scope: scope,
                user: testUser,
                profile: ''
            });
        }));

        it('should contain endorsements map', function () {
            expect(ProfileCtrl).toBeDefined();
        });

        it('should contain method showFriends()', function () {
            expect(ProfileCtrl.showFriends).toBeFunction();
        });

        it('should contain method getReviews()', function () {
            expect(ProfileCtrl.getReviews).toBeFunction();
        });

        it('should contain method getExperience()', function () {
            expect(ProfileCtrl.getExperience).toBeFunction();
        });

        it('should contain array reviews', function () {
            expect(ProfileCtrl.reviews).toBeArray();
        });

        it('should contain array experience', function () {
            expect(ProfileCtrl.experience).toBeArray();
        });
    });
}());
