(function() {
    'use strict';

    function lockboxCtrl ($ionicModal, $scope, $sce ,$ionicLoading, lockboxDocuments, $ionicPopup, modalService) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;
        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
        vm.currentDoc = "";


        vm.showModal = function (modalName) {
            modalService.show(modalName);
        };

        vm.closeModal = function (modalName) {
            modalService.close(modalName);
        };

        vm.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        vm.onPdfEvent = function(type){
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
                console.log("anima end");
                if(vm.currentDoc.sku == 'mvr' ){
                    $scope.image =  vm.currentDoc.url;
                }else if(vm.currentDoc.sku == 'bg'){
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

    lockboxCtrl.$inject = ['$ionicModal', '$scope', '$sce', '$ionicLoading', 'lockboxDocuments', '$ionicPopup', 'modalService'];

    angular
        .module('lockbox', [ 'pdf' ])
        .controller('lockboxCtrl', lockboxCtrl);

})();
