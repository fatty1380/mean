(function () {
    'use strict';

    angular
        .module('company')
        .controller('CompanyCtrl', CompanyCtrl);

    CompanyCtrl.$inject = ['company', 'activityService', '$ionicLoading', '$ionicPopup'];
    function CompanyCtrl(company, activityService, $ionicLoading, $ionicPopup) {
        var vm = this;
        vm.apply = apply;
        vm.follow = follow;
        
        function initialize() {
            vm.company = angular.extend(defaultCompany, company);
            vm.jobs = jobs;
            vm.feed = defaultFeed;

            // activityService.getCompanyFeed(company.id).then(
            //     function (result) {
            //         $ionicLoading.hide();
            //         console.log('getFeed() ', result);
            //         vm.feed = result;
            //     }, function () {
            //         $ionicLoading.hide();
            //         vm.feed = defaultFeed;
            //     });
                
            $ionicLoading.hide();
        }
        
        function goBack() {
             //ng-click="$ionicGoBack()"
        }
        
        function follow() {
            $ionicLoading.show({
                template: '<i class="icon ion-checkmark"></i><br>Following',
                duration: 2000
            })
        }

		function apply() {
			var applyPopup = $ionicPopup.confirm({
				title: 'Send Application',
				template: 'This will send your profile to ' + (vm.company.name || 'the employer') + ' for review. Continue?'
			});
			applyPopup.then(function (res) {
				if (res) {
					console.log('You are sure');
				} else {
					console.log('You are not sure');
				}
			});
		}

        initialize();
    }

    var jobs = [{
        '_type': 'job',
        'id': 'sampleJob#2',
        'user': '55a8c832f58ef0900b7ca14c',
        'modified': '2015-08-19T16:09:19.217Z',
        'created': '2015-08-19T16:09:19.216Z',
        'isPublic': true,
        'comments': [],
        'message': 'Be home every night and enjoy all the benefits that come with working for a Fortune 400, Private Fleet',
        'title': 'Local Class A Delivery Driver',
        '__v': 0,
        'location':
        {
            'created': '2015-08-19',
            'coordinates': [ 
                '37.6673051', 
                '-122.3827679'
            ],
            'type': 'Point',
            'placeName': 'San Francisco Bay Area, CA'
        }

    },
        {
        '_type': 'job',
            'id': 'sampleJob#2',
            'user': '55d76f65fa4aad2e1d66d58e',
            'modified': '2015-08-21T18:52:23.034Z',
            'created': '2015-08-21T18:52:23.030Z',
            'isPublic': true,
            'comments': [],
            'message': 'Be home every night and enjoy all the benefits that come with working for a Fortune 400, Private Fleet',
            'title': 'Local Class A Delivery Driver',
            '__v': 0,
            'location':
            {
                'created': '2015-08-21',
                'coordinates': [
                     '45.5230622', 
                '-122.6764816'
                ],
                'type': 'Point',
                'placeName': 'Portland, OR (Local)'
            }

        }];


    var defaultCompany = {
        name: 'Company Name',
        
    }
    
    var defaultFeed = [
        {
            id: '11',
            user: {displayName: 'Core-Mark International'},
            company: defaultCompany,
            created: '2015-09-09T18:52:23.030Z',
            likes: [],
            comments: [],
            title: 'The best infrastructure!',
            message: 'Core-Mark is the leader in fresh, in part, because of our investment in our fleet. Check out the cool technology inside our iconic trucks!',
            imageURL: 'https://scontent.fsnc1-1.fna.fbcdn.net/hphotos-xpa1/v/t1.0-9/11949485_991785164177088_8981821029263707945_n.png?oh=b2e610f7cabfac29015d155ad4fc8706&oe=56A4A8F4'
        },
        {
            id: '12',
            user: {displayName: 'Core-Mark International'},
            company: defaultCompany,
            created: '2015-09-04T18:52:23.030Z',
            likes: [],
            comments: [],
            title: 'Company News Title',
            message: 'Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo.'
        },
        {
            id: '13',
            user: {displayName: 'Core-Mark International'},
            company: defaultCompany,
            created: '2015-08-31T18:52:23.030Z',
            likes: [],
            comments: [],
            title: 'Company News Title',
            message: 'Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo.'
        },
        {
            id: '14',
            user: {displayName: 'Core-Mark International'},
            company: defaultCompany,
            created: '2015-08-24T18:52:23.030Z',
            likes: [],
            comments: [],
            title: 'Company News Title',
            message: 'Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo.'
        },
        {
            id: '15',
            user: {displayName: 'Core-Mark International'},
            company: defaultCompany,
            created: '2015-08-21T18:52:23.030Z',
            likes: [],
            comments: [],
            title: 'Company News Title',
            message: 'Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo.'
        },
        {
            id: '16',
            user: {displayName: 'Core-Mark International'},
            company: defaultCompany,
            created: '2015-08-19T18:52:23.030Z',
            likes: [],
            comments: [],
            title: 'Company News Title',
            message: 'Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo.'
        }
    ];
})();
