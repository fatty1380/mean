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

    lockboxDocuments.$inject = ['$rootScope', '$window', '$cordovaFile', '$ionicActionSheet', '$ionicLoading', 'API', '$q', 'settings', 'cameraService', 'lockboxModalsService'];

    function lockboxDocuments($rootScope, $window, $cordovaFile, $ionicActionSheet, $ionicLoading, API, $q, settings, cameraService, lockboxModals) {

        var vm = this;

        vm.IOS_PATH = cordova.file.documentsDirectory;
        vm.ANDROID_PATH = cordova.file.dataDirectory + '/documents/';

        vm.documents = [];

        //stubDocuments.forEach(function (doc) {
        //    addDocument(doc);
        //});

        function getId(e) { return e.id || e._id; }

        // TODO: Refactor to be "refresh documents"
        function getDocuments() {
            //return $http.get(settings.documents).then(
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
                    return vm.documents;
                });
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
                console.log('Pushing doc into docs', doc, vm.documents);
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
                    deferred.reject({ error: false, message: 'Action Sheet Cancelled' });
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

                    saveFileToDevice(newDocumentResponse);

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
        function orderReports(doc) {
            console.warn(' doc --->>>', doc);
            lockboxModals
                .showOrderReportsModal()
                .then(function (response) {
                    console.warn(' response --->>>', response);
                })
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

        function saveFileToDevice (file) {
            var fileData = file.data,
                fileID = fileData.id + '.jpeg',
                fileOwner = fileData.user,
                fileURL = fileData.url.replace(/^data:image\/(png|jpeg);base64,/, ""),
                path = vm.IOS_PATH; //TODO: check the platform and use correct path

            $cordovaFile.checkDir(path, 'lockbox')
                .then(function () {
                    path += 'lockbox/';
                    console.info(' --->>> has dir lockbox <<<--- ');
                    console.warn(' path --->>>', path);
                    writeFileInUserFolder(path, fileOwner, fileID, fileURL);
                }, function () {
                    $cordovaFile.createDir(path, "lockbox", false)
                        .then(function () {
                            path += 'lockbox/';
                            console.info(' --->>> lockbox dir created<<<--- ');
                            console.warn(' path --->>>', path);
                            writeFileInUserFolder(path, fileOwner, fileID, fileURL);
                        });
                });
        }

        function writeFileInUserFolder (path, user, name, data) {
            console.info(' --->>> writeFileInUserFolder <<<--- ', arguments);

            $cordovaFile
                .checkDir(path, user).then(function () {
                    console.info(' --->>> has user dir <<<--- ');
                    console.warn(' path --->>>', path);

                    path += user;
                    writeFile(path, name, data);
                    updateLocalStorageInfoAboutDocuments(user, {action: 'add'});
                }, function (error) {
                    console.info(' --->>> error <<<--- ', error);

                    $cordovaFile
                        .createDir(path, user, false)
                        .then(function () {
                            console.info(' --->>> created user dir <<<--- ');
                            console.warn(' path --->>>', path);
                            path += user;
                            writeFile(path, name, data);
                            updateLocalStorageInfoAboutDocuments(user, {action: 'add'});
                        }, function(error){
                            console.warn(' CANT CREATE USER FOLDER error --->>>', error);
                        });
                });
        }

        function writeFile (path, name, data) {
            console.warn(' path --->>>', path);
            $cordovaFile.writeFile(path, name, data)
                .then(function (file) {
                    console.warn(' File Created and Saved --->>>', file );
                });
        }

        function removeDocumentsByUser (user) {
            var path = vm.IOS_PATH + 'lockbox';

            $cordovaFile.checkDir(path, user).then(function () {
                $cordovaFile.removeRecursively(path, user)
                    .then(function (success) {
                        console.warn(' user Documents were removed success --->>>', success);
                        updateLocalStorageInfoAboutDocuments(user, {action: 'remove'});
                    }, function (error) {
                        console.warn(' user Documents are not removed. error --->>>', error);
                    });
            }, function () {
                console.info(' --->>> such user folder does not exist <<<--- ');
            });
        }

        function updateLocalStorageInfoAboutDocuments (user, data) {
            // action is a boolean, if true - we are adding file, if false - removing it.
            var savedUsers = $window.localStorage.getItem('userHasDocumentsSaved'),
                index = savedUsers instanceof Array && savedUsers.indexOf(user);

            if(!(savedUsers instanceof Array)) savedUsers = [];

            if(data.action === 'add' && index < 0){
                savedUsers.push(user);
            } else if (data.action === 'remove' && index >= 0) {
                savedUsers.splice(index, 1);
            }

            console.warn(' savedUsers --->>>', savedUsers);

            $window.localStorage.setItem('userHasDocumentsSaved', savedUsers);
        }

        return {
            getDocuments: getDocuments,
            addDocsPopup: addDocsPopup,
            removeDocuments: removeDocuments,
            updateDocument: updateDocument,
            saveFileToDevice: saveFileToDevice,
            writeFileInUserFolder: writeFileInUserFolder,
            removeDocumentsByUser: removeDocumentsByUser,
            updateLocalStorageInfoAboutDocuments: updateLocalStorageInfoAboutDocuments,
            writeFile: writeFile
            //getStubDocuments: getStubDocuments
        }
    }

    var stubDocuments = [
        {
            id: '0',
            sku: 'mvr',
            name: 'Motor Vehicle Report',
            created: '2015-07-11 10:33:05',
            url: 'assets/lockbox/driving-record-1.gif',
            expires: null,
            bucket: 'outset-dev',
            key: 'kajifpaiueh13232'
        },
        {
            id: '1',
            sku: 'bg',
            name: 'Background Report',
            created: '2015-07-11 10:33:05',
            url: 'assets/lockbox/sample_credit_report.pdf',
            expires: null,
            bucket: 'outset-dev',
            key: 'kajifpaiueh13232222'
        },
        {
            id: '2',
            sku: 'cdl',
            name: 'Commercial Driver License',
            created: null,
            url: null,
            expires: null
        }
    ];

})();
