(function() {
    'use strict';

    function lockboxCtrl ($ionicModal, $scope, $sce ,$ionicLoading, lockboxDocuments, $ionicPopup, modalService) {
        var vm = this;

        vm.addDocsPopup = lockboxDocuments.addDocsPopup;
        vm.currentDoc = null;
        vm.documents = [];

        vm.showModal = function (modalName) {
            modalService.show(modalName);
        };

        vm.closeModal = function (modalName) {
            modalService.close(modalName);
        };

        vm.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        function getDocs () {
            lockboxDocuments
                .getDocuments()
                .then(function (response) {
                    console.log('Documents List', response);
                   /* response.data = [
                        {
                            id: '1234abcd5678efab90123',
                            sku: 'mvr',
                            name: 'Forest',
                            created: '2015-07-11 10:33:05',
                            url: 'http://www.freeoboi.ru/images/558811701.jpg',
                            expires: null,
                            bucket: 'outset-dev',
                            key: 'kajifpaiueh13232'
                        },
                        {
                            id: '1234abcd5678efab9011212',
                            sku: 'bg',
                            name: 'multirule.pdf',
                            created: '2015-07-11 10:33:05',
                            url: '420f08027.pdf',
                            expires: null,
                            bucket: 'outset-dev',
                            key: 'kajifpaiueh13232'
                        },
                        {
                            id: '1234abcd5678efab9011212',
                            sku: 'bg',
                            name: 'TeachText.pdf',
                            created: '2015-07-11 10:33:05',
                            url: 'TeachText.pdf',
                            expires: null,
                            bucket: 'outset-dev',
                            key: 'kajifpaiueh13232222'
                        },
                        {
                            id: '1234abcd5678efab9011211',
                            sku: 'bg',
                            name: 'Lift-truck training',
                            created: '2015-08-11 10:23:05',
                            url: 'indg462.pdf',
                            expires: null,
                            bucket: 'outset-dev',
                            key: 'kajifpaiueh13232'
                        }
                    ];*/
                    vm.documents = response.data;
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

    lockboxCtrl.$inject = ['$ionicModal', '$scope', '$sce', '$ionicLoading', 'lockboxDocuments', '$ionicPopup', 'modalService'];

    angular
        .module('lockbox', [ 'pdf' ])
        .controller('lockboxCtrl', lockboxCtrl);

})();
