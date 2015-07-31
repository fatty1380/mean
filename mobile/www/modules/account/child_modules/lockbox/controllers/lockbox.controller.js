(function() {
    'use strict';

    function lockboxCtrl ( $ionicActionSheet, $ionicModal, $scope, PDFViewerService, $sce ,$ionicLoading, lockboxDocuments) {
        var vm = this;

        vm.lockboxDocuments = lockboxDocuments;
        vm.addDocsPopup = lockboxDocuments.addDocsPopup;

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.scale = 1;
        $scope.pages = 10;
        $scope.instance = PDFViewerService.Instance("viewer");
        $scope.nextPage = function() {
            $scope.instance.nextPage();
        };
        $scope.prevPage = function() {
            $scope.instance.prevPage();
        };
        $scope.gotoPage = function(page) {
            $scope.instance.gotoPage(page);
        };
        $scope.setScale = function(v) {
            $scope.instance.setScale(v);
        };
        $scope.reRender = function() {
            $scope.instance.reRender();
        };
        $scope.pageLoaded = function(curPage, totalPages) {
            //console.log('pageLoaded ',curPage, totalPages);
            $scope.currentPage = curPage;
            $scope.totalPages = totalPages;
        };
        $scope.loadProgress = function(loaded, total, state) {
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
            console.log(" ");
            console.log("viewDoc()");
            console.log(vm.lockboxDocuments);
            console.log(doc);
            vm.currentDoc = doc;
            $scope.modal.show();
        };

        vm.addDocsPopup = function() {
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a Picture' },
                    { text: 'Order Reports' }
                ],
                titleText: '<span class="title">Add documents</span>',
                cancelText: 'Cancel',
                cssClass: 'social-actionsheet',
                cancel: function() {
                    console.log("Cancel");
                },
                buttonClicked: function(index) {
                    switch(index){
                        case 0:
                            takePicture();
                            break;
                        case 1:
                            orderReports();
                            break;
                    }
                    return true;
                }
            });
        };

        function takePicture(){
            console.log('takePicture');
        }
        function orderReports(){
            console.log('orderReports');
        }

    }

    lockboxCtrl.$inject = [ '$ionicActionSheet', '$ionicModal', '$scope' ,'PDFViewerService', '$sce', '$ionicLoading', 'lockboxDocuments'];

    angular
        .module('lockbox', [ 'pdf' ])
        .controller('lockboxCtrl', lockboxCtrl);

})();
