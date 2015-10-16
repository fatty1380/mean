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

    lockboxDocuments.$inject = ['userService', '$cordovaFileTransfer', '$window', '$cordovaFile', '$ionicActionSheet', '$ionicLoading', 'API', '$q', 'settings', 'cameraService', 'lockboxModalsService'];

    function lockboxDocuments(userService, $cordovaFileTransfer, $window, $cordovaFile, $ionicActionSheet, $ionicLoading, API, $q, settings, cameraService, lockboxModalsService) {

        var vm = this;

        // vm.IOS_PATH = cordova.file.documentsDirectory;
        // vm.ANDROID_PATH = cordova.file.dataDirectory + 'Documents/';
        vm.path = cordova.file.documentsDirectory; // ionic.Platform.isIOS() ? vm.IOS_PATH : vm.ANDROID_PATH;
        vm.LOCKBOX_FOLDER = vm.path + 'lockbox/';
        vm.userData = userService.profileData;
        vm.documents = [];

        //stubDocuments.forEach(function (doc) {
        //    addDocument(doc);
        //});

        function getId(e) { return e.id || e._id; }

        // TODO: Refactor to be "refresh documents"
        function getDocuments(saveToDevice) {
            //return $http.get(settings.documents).then(
            return API.doRequest(settings.documents, 'get')
                .then(function success(documentListResponse) {
                    var docs = documentListResponse.data;
                    console.warn(' saveToDevice --->>>', saveToDevice);
                    docs = [
                        {
                            id: '0',
                            sku: 'mvr',
                            name: 'Mushroom',
                            created: '2015-07-11 10:33:05',
                            url: 'http://vignette4.wikia.nocookie.net/fantendo/images/5/52/Mushroom2.PNG',
                            expires: null,
                            bucket: 'outset-dev',
                            key: 'kajifpaiueh13232'
                        },
                        {
                            id: '1',
                            sku: 'bg',
                            name: 'Create PDF',
                            created: '2015-07-11 10:33:05',
                            url: 'http://presevo.rs/u/uploads/lesson2.pdf',
                            expires: null,
                            bucket: 'outset-dev',
                            key: 'kajifpaiueh13232222'
                        }
                    ];
                    angular.forEach(docs, function (doc) {
                        if (saveToDevice) {
                            // NOTE: This returns a promise and the file may not be fully saved
                            // to the device when teh method returns
                            saveExistingFiles(doc);
                        }
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
                    console.warn(' rawImageResponse --->>>', rawImageResponse);
                    return lockboxModalsService.showCreateModal({ image: rawImageResponse, sku: sku });
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
                    });

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
            lockboxModalsService
                .showOrderReportsModal()
                .then(function (response) {
                    console.warn(' response --->>>', response);
                })
        }
        
        function removeDocuments(documents) {
            _.each(documents, function (doc) {
                console.log('Removing Doc: %s w/ ID: %s ', doc.sku, doc.id);

                console.warn(' doc --->>>', doc);

                _.remove(vm.documents, { id: doc.id });

                removeOneDocument(doc);
                
                var stub = _.find(stubDocuments, { sku: doc.sku });
                if (!!stub) {
                    addDocument(stub);
                }
                
                return API.doRequest(settings.documents + doc.id, 'delete');
                
            })
        }

        function saveFileToDevice (file) {
            var fileData = file.data,
                fileID = fileData.name + '_' + fileData.id + '.txt',
                fileOwner = fileData.user,
                fileURL = fileData.url,
                path = vm.path;

            $cordovaFile.checkDir(path, 'lockbox')
                .then(function () {
                    path += 'lockbox/';

                    writeFileInUserFolder(path, fileOwner, fileID, fileURL);
                }, function () {
                    $cordovaFile.createDir(path, "lockbox", false)
                        .then(function () {
                            path += 'lockbox/';
                            writeFileInUserFolder(path, fileOwner, fileID, fileURL);
                        });
                });
        }

        function saveExistingFiles (doc) {
            var options = {};
            var extension = doc.url.split('.').pop();
            var path = vm.LOCKBOX_FOLDER + vm.userData.id + '/' + doc.name.replace(' ', '_') + '.' + extension;

            return $cordovaFileTransfer
                .download(doc.url, path, options, true);
        }

        function writeFileInUserFolder (path, user, name, data) {
            $cordovaFile
                .checkDir(path, user).then(function () {
                    path += user;
                    writeFile(path, name, data);
                    updateLocalStorageInfoAboutDocuments(user, {action: 'add'});
                }, function (error) {
                    $cordovaFile
                        .createDir(path, user, false)
                        .then(function () {
                            path += user;
                            writeFile(path, name, data);
                            updateLocalStorageInfoAboutDocuments(user, {action: 'add'});
                        });
                });
        }

        function writeFile (path, name, data) {
            $cordovaFile.writeFile(path, name, data)
                .then(function (file) {
                    console.warn(' File Created and Saved --->>>', file );
                });
        }

        function removeDocumentsByUser (user) {
            var path = vm.LOCKBOX_FOLDER;

            $cordovaFile.checkDir(path, user).then(function () {
                $cordovaFile.removeRecursively(path, user)
                    .then(function (success) {
                        console.warn(' user Documents were removed success --->>>', success);
                        updateLocalStorageInfoAboutDocuments(user, {action: 'remove'});
                    }, function (error) {
                        console.error(' user Documents are not removed. error --->>>', error);
                    });
            }, function () {
                console.error(' --->>> such user folder does not exist <<<--- ');
            });
        }

        function removeOneDocument (doc) {
            if(!doc) return;
            var path = vm.LOCKBOX_FOLDER,
                userID = doc.userId  || vm.userData.id || doc.user && doc.user.id,
                documentName = doc.name + '_' + doc.id + '.txt';

            $cordovaFile.checkDir(path, userID).then(function () {
                path += userID;
                $cordovaFile.removeFile(path, documentName);
            }, function () {
                console.error(' --->>> such user folder does not exist <<<--- ');
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

            $window.localStorage.setItem('userHasDocumentsSaved', savedUsers);
        }

        function getFilesByUserId (id) {
            var path = vm.path;
            var hasLockbox = false;
            var hasUserDir = false;

            return $cordovaFile.checkDir(path, 'lockbox')
                .then(function () {
                    path += 'lockbox/';
                    hasLockbox = true;

                    return $cordovaFile.checkDir(path, id);
                })
                .then(function (dir) {
                    path += id;
                    hasUserDir = true;

                    var dirReader = dir.createReader();
                    var entries = [];


                    function readFolders() {
                        var q = $q.defer();

                        // Keep calling readEntries() until no more results are returned.
                        function readEntries() {
                            dirReader.readEntries (function(results) {
                                if (results.length) {
                                    entries = entries.concat(toArray(results));
                                    return readEntries();
                                }
                                return resolveDocuments(entries).then(function(entries) {
                                    q.resolve(entries);
                                });
                            });
                        }

                        readEntries();

                        return q.promise;
                    }

                    function toArray(list) {
                        return Array.prototype.slice.call(list || [], 0);
                    }

                    function resolveDocuments (entries) {
                        var docsPromises = [];

                        angular.forEach(entries, function (entry) {
                            docsPromises.push(createDocumentPromise(entry));
                        });

                        return $q.all(docsPromises).then(function (resolvedDocuments) {
                            vm.documents = resolvedDocuments;
                            return resolvedDocuments;
                        });
                    }

                    return readFolders();
                })
                .catch(function (err) {
                    if (!!hasLockbox) {
                        return $q.when(getDocuments(true));
                    } else {
                        $cordovaFile.createDir(path, "lockbox", false).then(function () {
                            return $q.when(getDocuments(true));
                        });
                    }
                });
        }

        function createDocumentPromise (entry) {
            var deferred = $q.defer();
            var entryExtension = entry.name.split('.').pop();

            if(entryExtension === 'txt'){
                $cordovaFile.readAsText(path, entry.name).then(function (data) {
                    deferred.resolve({
                        url: data,
                        name: entry.name.split('_')[0],
                        id: entry.name.split('_')[1].replace('.txt', ''),
                        userId: id
                    })
                }, function(err){
                    console.warn(' err --->>>', err);
                    deferred.reject(err)
                });
            }else{
                deferred.resolve({
                    name: entry.name.replace('_', ' '),
                    url: entry.nativeURL,
                    created: Date.now()
                });
            }
            return deferred.promise;
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
            writeFile: writeFile,
            getFilesByUserId: getFilesByUserId
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
