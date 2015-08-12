(function () {
    'use strict';

    var lockboxDocuments = function ($ionicActionSheet, $http, settings) {

        function getDocuments() {
            return $http.get(settings.documents)
        }

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
        };

        function takePicture(){
            console.log('takePicture');
        }
        function orderReports(){
            console.log('orderReports');
        }

        return {
            getDocuments: getDocuments,
            addDocsPopup: addDocsPopup
        }
    };

    lockboxDocuments.$inject = ['$ionicActionSheet', '$http', 'settings'];

    angular
        .module('lockbox')
        .service('lockboxDocuments', lockboxDocuments);

})();
