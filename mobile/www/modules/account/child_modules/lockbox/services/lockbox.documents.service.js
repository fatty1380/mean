(function () {
    'use strict';

    var lockboxDocuments = function ($ionicActionSheet) {
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
                url: 'http://someurl/somedocument.pdf',
                expires: null,
                bucket: 'outset-dev',
                key: 'kajifpaiueh13232'
            },
            {
                id: '1234abcd5678efab9011211',
                sku: 'ev',
                name: 'Some name111',
                created: '2015-08-11 10:23:05',
                url: 'http://someurl/somedocument.pdf',
                expires: null,
                bucket: 'outset-dev',
                key: 'kajifpaiueh13232'
            }
        ];

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

    };


    lockboxDocuments.$inject = ['$ionicActionSheet'];

    angular
        .module('lockbox')
        .service('lockboxDocuments', lockboxDocuments);

})();
