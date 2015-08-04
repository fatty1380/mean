(function() {
    'use strict';

    function lockboxCtrl ( $ionicActionSheet, $ionicModal, $scope, PDFViewerService, $sce ,$ionicLoading, lockboxDocuments, $ionicPopup) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;
        vm.addDocsPopup = lockboxDocuments.addDocsPopup;

        vm.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        vm.onPdfEvent = function(type){
            console.log("   **** "+type+"  ****");
            switch(type){
                case "loadStart":
                    $ionicLoading.show({
                        template: 'PDF Loading. Please Wait.'
                    })
                    break;
                case 'loadComplete':
                    $ionicLoading.hide();
                    break;
                case 'loadError':
                    $ionicLoading.hide();

                   $ionicPopup.alert({
                        title: type,
                        template: 'Please, try later.'
                    });
                    break;
                default:
                    $ionicLoading.hide();
                    break;
            }
        };

        vm.loadProgress = function(loaded, total, state) {
            //console.log('loadProgress =', loaded, 'total =', total, 'state =', state);
            //console.log('loadProgress = ',Math.ceil(loaded/total* 100) +" %");
            var progress = Math.ceil(loaded/total* 100);
            if(progress <= 100){
                $scope.loadingProgress = Math.ceil(loaded/total * 100);
            }
        };

        $ionicModal.fromTemplateUrl('modules/account/child_modules/lockbox/templates/modal-preview.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.$on('modal.shown', function() {
            console.log('modal.shown');
            $scope.pdfURL = {src:vm.currentDoc.url};
            $scope.image =  vm.currentDoc.url;
        });

        $scope.$on('modal.hidden', function() {
            $scope.image  = "";
        });

        vm.viewDoc = function(doc) {
            console.log(doc);
            vm.currentDoc = doc;
            $scope.modal.show();
        }
    }

    lockboxCtrl.$inject = [ '$ionicActionSheet', '$ionicModal', '$scope' ,'PDFViewerService', '$sce', '$ionicLoading', 'lockboxDocuments', '$ionicPopup'];

    angular
        .module('lockbox', [ 'pdf' ])
        .controller('lockboxCtrl', lockboxCtrl);

})();
