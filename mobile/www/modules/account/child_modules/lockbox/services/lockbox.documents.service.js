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

    lockboxDocuments.$inject = ['$rootScope', '$ionicActionSheet', '$ionicLoading', 'API', '$q', 'settings', 'cameraService', 'lockboxModalsService'];

    function lockboxDocuments($rootScope, $ionicActionSheet, $ionicLoading, API, $q, settings, cameraService, lockboxModals) {

        var vm = this;

        vm.documents = stubDocuments;

        $rootScope.$watch('vm.documents', function (data) {
            console.warn('changed vm.documents --->>>', vm.documents);
            console.warn(' data --->>>', data);
        });

        return {
            getDocuments: getDocuments,
            addDocsPopup: addDocsPopup,
            removeDocuments: removeDocuments,
            updateDocument: updateDocument,
            newDocPopup: takePicture,
            orderReports: orderReports
            //getStubDocuments: getStubDocuments
        }

        // TODO: Refactor to be "refresh documents"
        function getDocuments() {
            return API.doRequest(settings.documents, 'get').then(
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
                    $ionicLoading.hide();
                });
        }

        function addDocument(doc) {
            var i = !!doc.id ? _.findIndex(vm.documents, { id: doc.id }) : -1;
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
                console.log('Pushing doc into docs', doc, vm.documents);
                vm.documents.push(doc);
                return true;
            }
        }

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
        
        function updateDocument(doc, data) {
            _.extend(doc, data);
            return API.doRequest(settings.documents + doc.id, 'put', data, true);
        }

        function takePicture(sku) {
            debugger;
            sku = sku.sku || sku;
            
            return cameraService.showActionSheet()
                .then(function success(rawImageResponse) {
                    return lockboxModals.showCreateModal({ image: rawImageResponse, sku: sku });
                })
                .then(function success(newDocumentObject) {
                    if (addDocument(newDocumentObject)) {
                        return API.doRequest(settings.documents, 'post', newDocumentObject, false);
                        //return $http.post(settings.documents, newDocumentObject);
                    } else {
                        return API.doRequest(settings.documents + newDocumentObject.id, 'put', newDocumentObject, false);
                        //return $http.put(settings.documents + newDocumentObject.id, newDocumentObject);
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
                    console.error('Failed to save new doc: ', err);

                    if (!!sku) {
                        return _.find(vm.documents, { sku: sku });
                    }
                    
                    return null;
                })
                .finally(function () {
                    $ionicLoading.hide();
                });

        }
        function orderReports() {
            console.log('orderReports');
        }
        
        function removeDocuments(documents) {
            _.each(documents, function (doc) {
                console.log('Removing Doc: %s w/ ID: %s ', doc.sku, doc.id);
                
                _.remove(vm.documents, { id: doc.id });
                
                var stub = _.find(stubDocuments, { sku: doc.sku });
                if (!!stub) {
                    addDocument(stub);
                }
                
                return API.doRequest(settings.documents + doc.id, 'delete');
                
            })
        }
    }

    var stubDocuments = [
        {
            sku: 'reports',
            name: 'MVR and Background Checks',
            action: 'Order',
            fn: 'orderDocs'
        },
        {
            sku: 'cdl',
            name: 'Commercial Driver License',
            info: ''
        },
        {
            sku: 'ins',
            name: 'Insurance',
            info: ''
        },
        {
            sku: 'cert',
            name: 'Certification',
            info: ''
        },
        {
            sku: 'misc',
            name: 'Any other Document',
            info: ''
        }
    ];

})();
