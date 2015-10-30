(function () {
	'use strict';
	
	angular.module('drivers')
		.controller('TruckerViewCtrl', TruckerViewCtrl);
		
	TruckerViewCtrl.$inject = ['user', 'profile', '$log'];

	function TruckerViewCtrl(user, profile, $log) {
		var vm = this;
		vm.user = user;
		vm.profile = profile || user;
		
		vm.tabs = [
			{
				heading: 'Experience',
				route: 'trucker.experience',
				disable: false
			},
			{
				heading: 'Review',
				route: 'trucker.review',
				disable: true
			},
			{
				heading: 'Reviews',
				route: 'trucker.reviews',
				disable: false
			},
			{
				heading: 'Documents',
				route: 'trucker.documents',
				disable: true
			}
		];
	}
	
	
	
	angular.module('drivers')
		.controller('TruckerReviewListCtrl', TruckerReviewListCtrl);
		
	TruckerReviewListCtrl.$inject = ['reviews', '$log'];

	function TruckerReviewListCtrl(reviews, $log) {
		var vm = this;
		vm.reviews = reviews;
	}
	
	
	angular.module('drivers')
		.controller('TruckerLockboxCtrl', TruckerLockboxCtrl);
		
	TruckerLockboxCtrl.$inject = ['documents', 'profile', 'Reports', '$sce', '$log'];

	function TruckerLockboxCtrl(documents, profile, Reports, $sce, $log) {
		var vm = this;
		vm.documents = documents;
		vm.profile = profile;
		
        vm.fileUser = vm.profile.displayName.replace(' ', '');
		
		vm.hasAccess = documents !== null;
		
		// FUNCTIONS //////////////////////////
		vm.viewFile = viewFile;
		
		///////////////////////////////////////
		function viewFile(document) {
            vm.error = null;
			var fileName = document.name;
			
			if (/^data:.*base64/.test(document.url)) {
				if (/image\/[\w]+;/.test(document.url)) {
					vm.imgSrc = document.url;
					$sce.trustAsResourceUrl(vm.imgSrc);
					vm.activeReport = fileName;
					vm.fileType = _.first(document.url.match(/image\/(\w+)/));
                    vm.documentTitle = vm.fileUser + '_' + fileName + '.' + (_.last(document.url.match(/image\/(\w+)/)) || '.jpg');
					return;
				} 
				else if (/application\/pdf/.test(document.url)) {
					vm.documentUrl = document.url;
					$sce.trustAsResourceUrl(vm.documentUrl);
					vm.activeReport = fileName;
					vm.fileType = _.first(document.url.match(/application\/\w+/));
                    vm.documentTitle = vm.fileUser + '_' + fileName + '.pdf';
					return;
				}
			}

            $log.debug('Opening File %o', fileName);

            var file = vm.reports[fileName];

            DocAccess.updateFileUrl(vm.driver._id, file)
                .then(function (success) {
                    vm.documentUrl = success.url;
                    vm.documentTitle = vm.fileUser + '_' + fileName + '.pdf';

                    $sce.trustAsResourceUrl(vm.documentUrl);

                    vm.reports[success.sku] = success;

                    vm.activeReport = fileName;
                })
                .catch(function (error) {
                    $log.warn('[DocViewCtrl.updateFileUrl] %s', error);
                    vm.error = error;
                }
            );
        }
	}
	
	
})();