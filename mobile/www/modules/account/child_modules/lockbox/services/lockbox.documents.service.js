(function () {
    'use strict';

    var lockboxDocuments = function ($ionicActionSheet) {
        var vm = this;

        vm.docs = [
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
                url: 'http://www.epa.gov/otaq/consumer/420f08027.pdf',
                expires: null,
                bucket: 'outset-dev',
                key: 'kajifpaiueh13232'
            },
            {
                id: '1234abcd5678efab9011212',
                sku: 'bg',
                name: 'TeachText.pdf',
                created: '2015-07-11 10:33:05',
                url: 'http://genesismission.jpl.nasa.gov/educate/scimodule/UnderElem/UnderElem_pdf/TeachText.pdf',
                expires: null,
                bucket: 'outset-dev',
                key: 'kajifpaiueh13232222'
            },
            {
                id: '1234abcd5678efab9011211',
                sku: 'bg',
                name: 'Lift-truck training',
                created: '2015-08-11 10:23:05',
                url: 'http://www.hse.gov.uk/pubns/indg462.pdf',
                expires: null,
                bucket: 'outset-dev',
                key: 'kajifpaiueh13232'
            }
        ];

        vm.addDocsPopup = function() {
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
