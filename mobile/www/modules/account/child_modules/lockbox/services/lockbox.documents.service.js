(function () {
    'use strict';

    angular
        .module('lockbox')
        .service('lockboxDocuments', lockboxDocuments);

    lockboxDocuments.$inject = ['$ionicActionSheet', '$http', 'settings'];

    function lockboxDocuments ($ionicActionSheet, $http, settings) {

        function getDocuments() {
            return $http.get(settings.documents)
        }
        
        //function getStubDocuments() {
        //    return stubDocuments;
        //}

        function addDocsPopup() {
            $ionicActionSheet.show({
                buttons: [
                    {text: 'Take a Picture'},
                    {text: 'Order Reports'}
                ],
                titleText: '<span class="title">Add documents</span>',
                cancelText: 'Cancel',
                cssClass: 'document-actionsheet',
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

        return {
            getDocuments: getDocuments,
            addDocsPopup: addDocsPopup
            //getStubDocuments: getStubDocuments
        }
    }
    
    //var stubDocuments = [
    //    {
    //        id: '1234abcd5678efab90123',
    //        sku: 'mvr',
    //        name: 'Motor Vehicle Report',
    //        created: '2015-07-11 10:33:05',
    //        url: 'assets/lockbox/driving-record-1.gif',
    //        expires: null,
    //        bucket: 'outset-dev',
    //        key: 'kajifpaiueh13232'
    //    },
    //    {
    //        id: '1234abcd5678efab9011212',
    //        sku: 'cdl',
    //        name: 'Driver License',
    //        created: '2015-07-11 10:33:05',
    //        url: 'assets/lockbox/cdl.png',
    //        expires: null,
    //        bucket: 'outset-dev',
    //        key: 'kajifpaiueh13232'
    //    },
    //    {
    //        id: '1234abcd5678efab9011212',
    //        sku: 'bg',
    //        name: 'Background Report',
    //        created: '2015-07-11 10:33:05',
    //        url: 'assets/lockbox/sample_credit_report.pdf',
    //        expires: null,
    //        bucket: 'outset-dev',
    //        key: 'kajifpaiueh13232222'
    //    }
    //];

})();
