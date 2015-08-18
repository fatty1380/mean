(function() {
    'use strict';

    angular
        .module('lockbox', [ 'pdf' ])
        .controller('LockboxCtrl', LockboxCtrl);

    LockboxCtrl.$inject = ['$ionicModal', '$scope', '$sce', '$ionicLoading', 'lockboxDocuments', '$ionicPopup', 'lockboxModalsService'];

    function LockboxCtrl ($ionicModal, $scope, $sce ,$ionicLoading, lockboxDocuments, $ionicPopup, lockboxModalsService) {
        var vm = this;

        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
        vm.currentDoc = null;
        vm.documents = [];

        vm.showEditModal = function (parameters) {
            lockboxModalsService
                .showLockboxEditModal(parameters)
                .then(function (result) {
                    console.log(result);
                },
                function (err) {
                    console.log(err);
                })
        };

        vm.showShareModal = function (parameters) {
            lockboxModalsService
                .showLockboxShareModal(parameters)
                .then(function (result) {
                    console.log(result);
                },
                function (err) {
                    console.log(err);
                })
        };

        vm.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        function getDocs () {
            lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);
                    
                    vm.documents = response.data instanceof Array ? response.data : lockboxDocuments.getStubDocuments();
                })
        };

        getDocs();

        vm.onPdfEvent = function(type) {
            console.log("   **** "+type+" ****");
            switch(type){
                case "loadStart":
                    $ionicLoading.show({
                        template: 'PDF Loading. Please Wait.'
                    });
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


        vm.openPreview = function(doc) {
            vm.currentDoc = doc;
            $scope.modal.show().then(function(){
                if(vm.currentDoc.sku === 'mvr' ){
                    $scope.image =  vm.currentDoc.url;
                }else if(vm.currentDoc.sku === 'bg'){
                    $scope.pdfURL = {src:vm.currentDoc.url};
                }
            });
        };

        vm.hidePreview = function() {
            $scope.modal.hide().then(function(){
                $scope.image  = "";
                vm.currentDoc = "";
                $scope.pdfURL = {src:""}
            });
        }

    }

})();
