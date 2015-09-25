(function () {
    'use strict';

    angular.module('lockbox').filter('getById', function () {
        return function (input, id) {
            var i = 0, len = input.length;
            for (; i < len; i++) {
                if (+input[i].id == +id) {
                    return input[i];
                }
            }
            return null;
        }
    });

    angular
        .module('lockbox')
        .service('lockboxDocuments', lockboxDocuments);

    lockboxDocuments.$inject = ['$ionicActionSheet', '$ionicLoading', '$http', 'settings', 'cameraService', 'lockboxModalsService'];

    function lockboxDocuments($ionicActionSheet, $ionicLoading, $http, settings, cameraService, lockboxModals) {

        var vm = this;

        vm.documents = [];
        
        stubDocuments.forEach(function (doc) {
            addDocument(doc);
        })

        function getId(e) { return e.id || e._id; }

        // TODO: Refactor to be "refresh documents"
        function getDocuments() {
            return $http.get(settings.documents).then(
                function success(documentListResponse) {
                    var docs = documentListResponse.data;

                    angular.forEach(docs, function (doc, index) {
                        addDocument(doc);
                    });
                    return vm.documents;
                }, function fail(result) {
                    console.error('Error getting docs: ', result);
                    return vm.documents;
                })
                .finally(function () {
                    return vm.documents;
                });;
        }

        function addDocument(doc) {
            var i = vm.documents.map(getId).indexOf(doc.id);

            if (i !== -1) {
                vm.documents[i] = doc;
                return false;
            }
            else {
                vm.documents.push(doc);
                return true;
            }
        }
        
        //function getStubDocuments() {
        //    return stubDocuments;
        //}

        function addDocsPopup() {
            $ionicActionSheet.show({
                buttons: [
                    { text: 'Take a Picture' },
                    { text: 'Order Reports' }
                ],
                titleText: '<span class="title">Add documents</span>',
                cancelText: 'Cancel',
                cssClass: 'document-actionsheet',
                cancel: function () {
                    console.log("Cancel");
                },
                buttonClicked: function (index) {
                    switch (index) {
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

        function takePicture() {
            cameraService.showActionSheet()
                .then(function success(rawImageResponse) {
                    return lockboxModals.showCreateModal({ image: rawImageResponse });
                })
                .then(function success(newDocumentResponse) {
                    
                    if (addDocument(newDocumentResponse)) {
                        return $http.post(settings.documents, newDocumentResponse);
                    } else {
                        return $http.put(settings.documents + newDocumentResponse.id, newDocumentResponse);
                    }
                })
                .catch(function reject(err) {
                    debugger;
                    console.error('Failed to save new doc: ', err);
                })
                .finally(function () {
                    $ionicLoading.hide();
                    
                    return vm.documents;
                });

        }
        function orderReports() {
            console.log('orderReports');
        }

        return {
            getDocuments: getDocuments,
            addDocsPopup: addDocsPopup
            //getStubDocuments: getStubDocuments
        }
    }
    
    var stubDocuments = [
       {
           id: '1234abcd5678efab90123',
           sku: 'mvr',
           name: 'Motor Vehicle Report',
           created: '2015-07-11 10:33:05',
           url: 'assets/lockbox/driving-record-1.gif',
           expires: null,
           bucket: 'outset-dev',
           key: 'kajifpaiueh13232'
       },
       {
           id: '1234abcd5678efab9011212',
           sku: 'cdl',
           name: 'Driver License',
           created: '2015-07-11 10:33:05',
           url: 'assets/lockbox/cdl.png',
           expires: null,
           bucket: 'outset-dev',
           key: 'kajifpaiueh13232'
       },
       {
           id: '1234abcd5678efab9011212',
           sku: 'bg',
           name: 'Background Report',
           created: '2015-07-11 10:33:05',
           url: 'assets/lockbox/sample_credit_report.pdf',
           expires: null,
           bucket: 'outset-dev',
           key: 'kajifpaiueh13232222'
       }
    ];

})();
