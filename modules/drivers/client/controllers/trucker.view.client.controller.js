(function () {
	'use strict';
	
	angular.module('drivers')
		.controller('TruckerViewCtrl', TruckerViewCtrl);
		
	TruckerViewCtrl.$inject = ['user', 'profile', 'request', '$log'];

	function TruckerViewCtrl(user, profile, request, $log) {
		var vm = this;
		vm.user = user;
		vm.profile = profile || user;
		
		vm.hasDocs = vm.profile === vm.user || true;
		
		var docCt = !!request && request.contents && request.contents.documents && request.contents.documents.length || 0;
		
		vm.tabs = [
			{
				heading: 'Experience',
				route: 'trucker.experience',
				disable: false
			},
			// {
			// 	heading: 'Review',
			// 	route: 'trucker.review',
			// 	disable: true
			// },
			{
				heading: 'Reviews',
				route: 'trucker.reviews',
				disable: false
			},
			{
				heading: !!docCt ? 'Documents ('+docCt+')' : 'Documents',
				route: 'trucker.documents',
				disable: !vm.hasDocs
			}
		];
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	angular.module('drivers')
		.controller('TruckerReviewListCtrl', TruckerReviewListCtrl);
		
	TruckerReviewListCtrl.$inject = ['reviews', '$log'];

	function TruckerReviewListCtrl(reviews, $log) {
		var vm = this;
		vm.reviews = reviews;
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	angular.module('drivers')
		.controller('TruckerLockboxCtrl', TruckerLockboxCtrl);
		
	TruckerLockboxCtrl.$inject = ['documents', 'request', 'profile', 'Reports', '$sce', '$log'];

	function TruckerLockboxCtrl(documents, request, profile, Reports, $sce, $log) {
		var vm = this;
		vm.documents = documents;
		vm.profile = profile;
		
        vm.fileUser = vm.profile.displayName.replace(' ', '');
		
		vm.hasAccess = documents !== null;
		
		// FUNCTIONS //////////////////////////
		vm.initDocument = initDocument;
		///////////////////////////////////////
		
		function initDocument(document) {
			var fileName = document.name;
			
			if (/^data:.*base64/.test(document.url)) {
				if (/image\/[\w]+;/.test(document.url)) {
					document.imgSrc = document.url;
					$sce.trustAsResourceUrl(document.imgSrc);
					document.activeReport = fileName;
					document.fileType = _.first(document.url.match(/image\/(\w+)/));
                    document.documentTitle = document.fileUser + '_' + fileName.replace(/ /g, '_') + '.' + (_.last(document.url.match(/image\/(\w+)/)) || '.jpg');
					return;
				} 
				else if (/application\/pdf/.test(document.url)) {
					document.documentUrl = document.url;
					$sce.trustAsResourceUrl(document.documentUrl);
					document.activeReport = fileName;
					document.fileType = _.first(document.url.match(/application\/\w+/));
                    document.documentTitle = document.fileUser + '_' + fileName + '.pdf';
					return;
				}
			}

            $log.debug('Opening File %o', fileName);

            var file = vm.reports[fileName];

            DocAccess.updateFileUrl(profile.id, file)
                .then(function (success) {
                    document.documentUrl = success.url;
                    document.documentTitle = document.fileUser + '_' + fileName + '.pdf';

                    $sce.trustAsResourceUrl(document.documentUrl);

                    document.reports[success.sku] = success;

                    document.activeReport = fileName;
                })
                .catch(function (error) {
                    $log.warn('[DocViewCtrl.updateFileUrl] %s', error);
                    document.error = error;
                }
            );
		}
	}
	
	
})();