(function() {
    'use strict';

    function lockboxCtrl ( $ionicActionSheet, $ionicModal, $scope, pdf ) {
        var vm = this;

       // $scope.pdfUrl = 'http://www.arb.ca.gov/msprog/onrdiesel/documents/multirule.pdf';
       /* $scope.pdfUrl = 'relativity.pdf';
        $scope.pdfName = 'Relativity: The Special and General Theory by Albert Einstein';
        $scope.scroll = 1;
        $scope.loading = 'load';

        $scope.onError = function(error) {
            console.log(error);
        }

        $scope.onLoad = function() {
            $scope.loading = '';
        }

        $scope.onProgress = function(progress) {
            console.log(progress);
        }

        $scope.pageLoaded = function(curPage, totalPages) {
            console.log(curPage,totalPages );

            $scope.currentPage = curPage;
            $scope.totalPages = totalPages;
        };*/




        $scope.pdfURL = "http://www.internationaltransportforum.org/jtrc/infrastructure/heavyveh/TrucksSum.pdf";
        $scope.scale = .5;
        $scope.pages = 0;
        $scope.instance = pdf.Instance("viewer");
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
        $scope.pageLoaded = function(curPage, totalPages) {
            console.log('pageLoaded ',curPage, totalPages);
            $scope.currentPage = curPage;
            $scope.totalPages = totalPages;
        };
        $scope.loadProgress = function(loaded, total, state) {
            //console.log('loadProgress =', loaded, 'total =', total, 'state =', state);
        };



        vm.docs = [
            {
                id: '1234abcd5678efab90123',
                sku: 'mvr',
                name: 'Motor Vehicle Report',
                created: '2015-07-11 10:33:05',
                url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Scania_R470_topline.JPG',
                expires: null,
                bucket: 'outset-dev',
                key: 'kajifpaiueh13232'
            },
            {
                id: '1234abcd5678efab9011212',
                sku: 'bg',
                name: 'Some name',
                created: '2015-07-11 10:33:05',
                url: 'http://www.arb.ca.gov/msprog/onrdiesel/documents/multirule.pdf',
                expires: null,
                bucket: 'outset-dev',
                key: 'kajifpaiueh13232'
            },
            {
                id: '1234abcd5678efab9011211',
                sku: 'ev',
                name: 'Some name111',
                created: '2015-08-11 10:23:05',
                url: 'http://lorempixel.com/820/1720/transport/6/sometext/',
                expires: null,
                bucket: 'outset-dev',
                key: 'kajifpaiueh13232'
            }
        ];

        $ionicModal.fromTemplateUrl('modules/account/child_modules/lockbox/templates/modal-document.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        vm.viewDoc = function(doc) {
            console.log(" ");
            console.log("viewDoc()");
            console.log(vm);

            vm.currentDoc = doc;
            $scope.modal.show();

        //    $scope.pdfUrl = 'http://www.arb.ca.gov/msprog/onrdiesel/documents/multirule.pdf';
        }


        $scope.getNavStyle = function(scroll) {
            if(scroll > 100) return 'pdf-controls fixed';
            else return 'pdf-controls';
        }

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
        }

        function takePicture(){
            console.log('takePicture');
        }
        function orderReports(){
            console.log('orderReports');
        }
    }

    lockboxCtrl.$inject = [ '$ionicActionSheet', '$ionicModal', '$scope' ,'PDFViewerService'];

    angular
        .module('lockbox', [ 'ngPDFViewer' ])
        .controller('lockboxCtrl', lockboxCtrl);

})();
