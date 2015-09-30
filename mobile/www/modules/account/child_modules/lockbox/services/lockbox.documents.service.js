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

    lockboxDocuments.$inject = ['$ionicActionSheet', '$ionicLoading', '$http', '$q', 'settings', 'cameraService', 'lockboxModalsService'];

    function lockboxDocuments($ionicActionSheet, $ionicLoading, $http, $q, settings, cameraService, lockboxModals) {

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
            var i = _.findIndex(vm.documents, { id: doc.id });
            var sku = (doc.sku || 'misc').toLowerCase();

            if (i !== -1) {
                vm.documents[i] = doc;
                return false;
            }
            else if (sku != 'misc' && (i = _.findIndex(vm.documents, { sku: sku })) != -1) {
                vm.documents[i] = doc;
                return true;
            }
            else {
                vm.documents.push(doc);
                return true;
            }
        }
        
        //function getStubDocuments() {
        //    return stubDocuments;
        //}

        function addDocsPopup(docSku) {
            var deferred = $q.defer();
            
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
                            deferred.resolve(takePicture(docSku));
                            break;
                        case 1:
                            deferred.resolve(orderReports(docSku));
                            break;
                    }
                    return true;
                }
            });
            
            return deferred.promise;
        }

        function takePicture(sku) {
            return cameraService.showActionSheet()
                .then(function success(rawImageResponse) {
                    return lockboxModals.showCreateModal({ image: rawImageResponse, sku: sku });
                })
                .then(function success(newDocumentObject) {
                    debugger;
                    if (addDocument(newDocumentObject)) {
                        return $http.post(settings.documents, newDocumentObject);
                    } else {
                        return $http.put(settings.documents + newDocumentObject.id, newDocumentObject);
                    }
                })
                .then(function saveSuccess(newDocumentResponse) {
                    console.log('Successfully saved document to server');
                    
                    if (newDocumentResponse.status != 200) {
                        console.warn('Unknown Error in Doc Save response: ', newDocumentResponse);
                    }
                    
                    $ionicLoading.show({
                        template: '<i class="icon ion-checkmark"></i><br>Saved Document',
                        duration: 1000
                    })

                    return newDocumentResponse.data;
                })
                .catch(function reject(err) {
                    debugger;
                    console.error('Failed to save new doc: ', err);

                    return _.find(vm.documents, { sku: sku });
                })
                .finally(function () {
                    $ionicLoading.hide();
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
            id: '1234abcd5678efab901113',
            sku: 'bg',
            name: 'Background Report',
            created: '2015-07-11 10:33:05',
            url: 'assets/lockbox/sample_credit_report.pdf',
            expires: null,
            bucket: 'outset-dev',
            key: 'kajifpaiueh13232222'
        },
        {
            id: '1234abcd5678efab9011212',
            sku: 'cdl',
            name: 'Commercial Driver License',
            created: null,
            url: null,
            expires: null
        }
    ];

})();
