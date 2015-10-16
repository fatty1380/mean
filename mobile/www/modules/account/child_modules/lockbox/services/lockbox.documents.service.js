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

                    var promiseArr = [];

                    angular.forEach(docs, function (doc) {
                        if (saveToDevice) {
                            // NOTE: This returns a promise and the file may not be fully saved
                            // to the device when teh method returns
                            promiseArr.push(saveExistingFiles(doc));
                        }
                    });

                    return $q.all(promiseArr);
                })
                .then(function (newDocuments) {
                    angular.forEach(newDocuments, function(doc){
                        addDocument( {name: doc.name, url: doc.nativeURL} );
                    });
                    return vm.documents;
                })
                .catch(function (result) {
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
            lockboxModalsService
                .showOrderReportsModal();
        }
        
        function removeDocuments(documents) {
            _.each(documents, function (doc) {
                console.log('Removing Doc: %s w/ ID: %s ', doc.sku, doc.id);

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
            var fileData = file.data;
            var path = vm.path;
            return $cordovaFile.checkDir(path, 'lockbox')
                .catch(function (err) {
                    return $cordovaFile.createDir(path, "lockbox", false);
                })
                .then(function () {
                    var options = {
                        path: path + 'lockbox/',
                        user: fileData.user,
                        name: fileData.name + '_' + fileData.id + '.txt',
                        data: fileData.url
                    };
                    return writeFileInUserFolder(options);
                });
        }

        function saveExistingFiles (doc) {
            var options = {};
            var extension = doc.url.split('.').pop();
            var path = vm.LOCKBOX_FOLDER + vm.userData.id + '/' + doc.name.replace(' ', '_') + '.' + extension;

            return $cordovaFileTransfer
                .download(doc.url, path, options, true);
        }

        function writeFileInUserFolder (options) {
            var path = options.path;
            var user = options.user;
            var name = options.name;
            var data = options.data;

            return $cordovaFile
                .checkDir(path, user)
                .catch(function () {
                    return $cordovaFile.createDir(path, user, false)
                })
                .then(function () {
                    path += user;
                    return writeFile(path, name, data);
                })
                .then(function (file) {
                    console.warn(' file --->>>', file);
                    updateStorageInfo(user, {action: 'add'});
                    return file;
                });
        }

        function writeFile (path, name, data) {
            return $cordovaFile.writeFile(path, name, data);
        }

        function removeDocumentsByUser (user) {
            var path = vm.LOCKBOX_FOLDER;

            return $cordovaFile.checkDir(path, user)
                .then(function () {
                    return $cordovaFile.removeRecursively(path, user)
                }, function (err) {
                    console.error(' --->>> such user folder does not exist <<<--- ', err);
                    return $q.reject(err)
                })
                .then(function (success) {
                    console.info(' user Documents were removed success --->>>', success);
                    return updateStorageInfo(user, {action: 'remove'});
                }, function (err) {
                    console.error(' user Documents are not removed. error --->>>', err);
                });
        }

        function removeOneDocument (doc) {
            if(!doc) return;
            
            var path = vm.LOCKBOX_FOLDER,
                userID = doc.userId  || vm.userData.id || doc.user && doc.user.id,
                documentName = doc.name + '_' + doc.id + '.txt';

            return $cordovaFile.checkDir(path, userID)
                .then(function () {
                    path += userID;
                    return $cordovaFile.removeFile(path, documentName);
                })
                .catch(function (err) {
                    console.warn(' err --->>>', err);
                });
        }

        function updateStorageInfo (user, data) {
            // action is a boolean, if true - we are adding file, if false - removing it.
            var ls = $window.localStorage;
            var savedUsers = ls.getItem('userHasDocumentsSaved'),
                index = savedUsers instanceof Array && savedUsers.indexOf(user);

            if(!(savedUsers instanceof Array)) savedUsers = [];

            if(data.action === 'add' && index < 0){
                savedUsers.push(user);
            } else if (data.action === 'remove' && index >= 0) {
                savedUsers.splice(index, 1);
            }

            ls.setItem('userHasDocumentsSaved', savedUsers);
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
                        return $cordovaFile.createDir(path, "lockbox", false).then(function () {
                            return $q.when(getDocuments(true));
                        });
                    }
                });
        }

        function createDocumentPromise (entry) {
            var deferred = $q.defer();
            var entryExtension = entry.name.split('.').pop();
            var userID = vm.userData.id;
            var path = vm.LOCKBOX_FOLDER + '/' + userID;

            if(entryExtension === 'txt'){
                $cordovaFile.readAsText(path, entry.name).then(function (data) {
                    deferred.resolve({
                        url: data,
                        name: entry.name.split('_')[0],
                        id: entry.name.split('_')[1].replace('.txt', ''),
                        userId: userID
                    })
                }, function(err){
                    console.warn(' err --->>>', err);
                    deferred.reject(err)
                });
            }else{
                deferred.resolve({
                    name: entry.name.replace('_', ' '),
                    url: entry.nativeURL
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
            updateLocalStorageInfoAboutDocuments: updateStorageInfo,
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
