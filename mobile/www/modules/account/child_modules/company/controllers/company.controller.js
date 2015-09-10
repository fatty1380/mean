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
        '_id': 'sampleJob#2',
        'user': '55a8c832f58ef0900b7ca14c',
        'modified': '2015-08-19T16:09:19.217Z',
        'created': '2015-08-19T16:09:19.216Z',
        'isPublic': true,
        'comments': [],
        'message': '</p><p><b>HOW YOU\'LL CONTRIBUTE</b></p><p>While much of the role involves driving, you’ll be first and foremost the face of our brand. You’ll be the primary point of contact for our customers, many of whom are <em>Fortune 500 </em>companies. And the loyalty and trust that evolve from the strong business relationships you build will create a huge value add for them—and our company. So if you love people and have a passion for customer service, read on.</p><p>With the variety of duties you’ll perform from day to day, you’ll constantly be on the go and never bored. You’ll deliver products safely and on time to multiple stops daily. Additional responsibilities will include offloading work, such as stacking and sorting delivered goods and pickups as needed, as well as:</p><ul><li>  Pre- and post-shift equipment/vehicle checks </li><li>  Checking load inventories against invoices for accuracy </li><li>  Unloading via ramp and hand dolly </li><li>  Securing empty pallets and totes in the truck </li><li>  Maintaining the cleanliness of your truck </li><li>  Returning equipment following use&nbsp; </li></ul>',
        'title': 'Class A Delivery Driver',
        '__v': 0,
        'location':
        {
            'created': '2015-08-19',
            'coordinates': [
                '37.71859032558816',
                '-78.75'
            ],
            'type': 'Point',
            'placeName': 'San Francisco, CA'
        }

    },
        {
            '_id': 'sampleJob#2',
            'user': '55d76f65fa4aad2e1d66d58e',
            'modified': '2015-08-21T18:52:23.034Z',
            'created': '2015-08-21T18:52:23.030Z',
            'isPublic': true,
            'comments': [],
            'message': 'Cranking out the code!',
            'title': 'Working',
            '__v': 0,
            'location':
            {
                'created': '2015-08-21',
                'coordinates': [
                    '43.69094764672715',
                    '-114.3830394744873'
                ],
                'type': 'Point'
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
