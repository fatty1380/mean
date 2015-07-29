(function() {
    'use strict';

    function lockboxCtrl ( $ionicActionSheet, $ionicModal, $scope ) {
        var vm = this;



        vm.docs = [
            {
                id: '1234abcd5678efab90123',
                sku: 'mvr',
                name: 'Motor Vehicle Report',
                created: '2015-07-11 10:33:05',
                url: 'http://someurl/somedocument.pdf',
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
       // vm.modal = $ionicModal.fromTemplate('<div class="modal"><header class="bar bar-header bar-positive"> <h1 class="title">I\'m A Modal</h1><div class="button button-clear" ng-click="vm.modal.hide()"><span class="icon ion-close"></span></div></header><content has-header="true" padding="true"><p>This is a modal</p></content><footer class="bar bar-footer bar-positive"><h1 class="title">Footer</h1></footer></div>', {
        //$scope.modal = $ionicModal.fromTemplateUrl('modules/account/child_modules/lockbox/controllers/modal.html', {

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

    lockboxCtrl.$inject = [ '$ionicActionSheet','$ionicModal',  '$scope' ];

    angular
        .module('lockbox')
        .controller('lockboxCtrl', lockboxCtrl);

})();
