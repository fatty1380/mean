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

    lockboxDocuments.$inject = ['userService', '$cordovaFileTransfer', '$window', '$cordovaFile', '$ionicActionSheet', '$ionicLoading', 'API', '$q', 'settings', 'cameraService', 'lockboxModalsService', 'welcomeService'];

    function lockboxDocuments(userService, $cordovaFileTransfer, $window, $cordovaFile, $ionicActionSheet, $ionicLoading, API, $q, settings, cameraService, lockboxModalsService, welcomeService) {

        var vm = this;

        // vm.IOS_PATH = cordova.file.documentsDirectory;
        // vm.ANDROID_PATH = cordova.file.dataDirectory + 'Documents/';
        try {
            vm.path = cordova.file.documentsDirectory; // ionic.Platform.isIOS() ? vm.IOS_PATH : vm.ANDROID_PATH;
            vm.LOCKBOX_FOLDER = vm.path + 'lockbox/';
        } catch (err) {
            console.warn('no cordova available, can\'t get access to documentsDirectory and lockbox folder');
        }

        vm.userData = userService.profileData;
        vm.documents = docTypeDefinitions;

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
            getFilesByUserId: getFilesByUserId,
            updateDocumentList: updateDocumentList,
            orderReports: orderReports,
            newDocPopup: takePicture
            //getStubDocuments: getStubDocuments
        }
        
        // TODO: Refactor to be "refresh documents"
        function getDocuments(saveToDevice) {
            //return $http.get(settings.documents).then(
            return API.doRequest(settings.documents, 'get')
                .then(function success(documentListResponse) {
                    var docs = documentListResponse.data;
                    var promiseArr = [];

                    if (!vm.path) { return $q.when(docs); }
                    if (!docs || !docs.length) { return $q.when([]); }

                    angular.forEach(docs, function (doc) {
                        if (saveToDevice) {
                            // NOTE: This returns a promise and the file may not be fully saved
                            // to the device when teh method returns

                            if (doc.url.indexOf('data:image') !== -1) {
                                saveFileToDevice(doc);
                                promiseArr.push($q.when(doc));
                            } else {
                                promiseArr.push(saveExistingFiles(doc));
                            }
                        }
                    });

                    return $q.all(promiseArr);
                })
                .then(function (newDocuments) {
                    var id, sku, name, url, user, created;

                    if (angular.isArray(newDocuments) && newDocuments.length) {
                        angular.forEach(newDocuments, function (doc) {
                            if (!doc.id && doc.name && doc.nativeURL) {
                                var docObject = parseDocFromFilename(doc.name);
                                
                                id = docObject.id;
                                sku = docObject.sku;
                                name = docObject.name;
                                url = doc.nativeURL;
                            } else {
                                id = doc.id;
                                sku = doc.sku;
                                name = doc.name;
                                url = doc.url;
                            }

                            user = getUserId(doc);
                            created = doc.created;

                            addDocument({
                                name: name,
                                url: url,
                                id: id,
                                user: user,
                                created: created,
                                sku: doc.sku
                            });
                        });
                    } else if (angular.isArray(newDocuments) && !newDocuments.length) {
                        // Itereate and add to avoid ovrewriting stubs
                        _.each(newDocuments, function (doc) {
                            addDocument(doc);
                        });
                    }
                    return vm.documents;
                })
                .catch(function (result) {
                    console.error('Error getting docs: ', result);
                    return vm.documents;
                })
                .finally(function () {
                    var hasRealDoc = _.some(vm.documents, function (doc) { return !!doc.id });
                    if (!hasRealDoc) {
                        welcomeService.initialize('lockbox.add');
                    }

                    console.warn('finally vm.documents >>>', vm.documents);
                    $ionicLoading.hide();
                });
        }

        function addDocument(doc) {
            var i = -1;
            var sku = (doc.sku || 'misc').toLowerCase();

            var def = _.find(docTypeDefinitions, { sku: doc.sku }) || {};

            if ((i = !!doc.id ? _.findIndex(vm.documents, { id: doc.id }) : -1) !== -1) {
                // If a document with the same ID is already in the array, replace it.
                vm.documents[i] = doc;
                return false;
            }
            else if (!def.multi && (i = _.findIndex(vm.documents, { sku: sku })) != -1) {
                // If the document Type does not allow multiple copies, and there is already
                // a copy with the same SKU, replace it.
                vm.documents[i] = doc;
                return true;
            }
            else {
                // Othewise, simply push the document into the array
                console.log('Pushing doc into docs', doc, vm.documents);
                vm.documents.push(doc);
                return true;
            }
        }

        function updateNewDocumentWithID(doc) {
            var i = _.findIndex(vm.documents, { url: doc.url, name: doc.name });
            if (i >= 0 && vm.documents[i]) {
                _.extend(vm.documents[i], doc);
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
            return API.doRequest(settings.documents + doc.id, 'put', data, true)
                .then(function () {
                    if (!vm.path) return _.extend(doc, data);
                    return renameLocalFile(doc, data);
                })
                .then(function (resp) {
                    return _.extend(doc, data);
                })
                .catch(function (err) {
                    console.warn(' err --->>>', err);
                });
        }

        function takePicture(sku) {

            return welcomeService.showModal('lockbox.add')
                .then(function () {
                    return cameraService.showActionSheet();
                })
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
                    // TODO: Is this a sync or async call?
                    saveFileToDevice(newDocumentResponse.data);

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

        function orderReports() {
            lockboxModalsService
                .showOrderReportsModal();
        }

        function removeDocuments(documents) {
            var promises = [];

            _.each(documents, function (doc) {
                console.log('Removing Doc: %s w/ ID: %s ', doc.sku, doc.id);

                _.remove(vm.documents, { id: doc.id });
                removeOneDocument(doc);

                var stub = _.find(docTypeDefinitions, { sku: doc.sku });
                var alreadyHasStub = _.find(vm.documents, { sku: doc.sku });

                if (!!stub && !alreadyHasStub) {
                    addDocument(stub);
                }

                //return API.doRequest(settings.documents + doc.id, 'delete');
                var promise = API.doRequest(settings.documents + doc.id, 'delete');

                promises.push(promise);
            });

            return $q.all(promises);
        }

        function saveFileToDevice(file) {
            var path = vm.path;

            updateNewDocumentWithID(file);

            return $cordovaFile.checkDir(path, 'lockbox')
                .catch(function () {
                    return $cordovaFile.createDir(path, "lockbox", false);
                })
                .then(function () {
                    var options = {
                        path: path + 'lockbox/',
                        user: getUserId(file),
                        name: file.id + '-' + getFileName(file),
                        data: file.url,
                        sku: file.sku
                    };
                    return writeFileInUserFolder(options);
                });
        }

        function saveExistingFiles(doc) {
            var id = doc.id;
            var name = id + "-" + getFileName(doc);
            var path = vm.LOCKBOX_FOLDER + vm.userData.id + '/' + name;

            return $cordovaFileTransfer
                .download(doc.url, path, {}, true);
        }

        function writeFileInUserFolder(options) {
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
                    updateStorageInfo(user, { action: 'add' });
                    return file;
                })
                .catch(function (err) {
                    console.warn(' err >>>', err);
                });
        }

        function writeFile(path, name, data) {
            return $cordovaFile.writeFile(path, name, data, true);
        }

        function removeDocumentsByUser(user) {
            var path = vm.LOCKBOX_FOLDER;

            return $cordovaFile.checkDir(path, user)
                .then(function (path) {
                    return $cordovaFile.removeRecursively(path, user)
                }, function (err) {
                    return $q.reject(err)
                })
                .then(function () {
                    return updateStorageInfo(user, { action: 'remove' });
                }, function (err) {
                    console.error(' user Documents are not removed. error --->>>', err);
                });
        }

        function removeOneDocument(doc) {
            console.warn(' removeOneDocument() doc >>>', doc);
            if (!doc) return;

            var path = vm.LOCKBOX_FOLDER,
                userID = getUserId(doc),
                documentName = doc.id + '-' + getFileName(doc);

            return $cordovaFile.checkDir(path, userID)
                .then(function (dir) {
                    path += userID;
                    return $cordovaFile.removeFile(path, documentName);
                })
                .catch(function (err) {
                    console.warn(' remove doc err --->>>', err);
                });
        }

        function updateStorageInfo(user, data) {
            var storage = $window.localStorage;
            var usersJSON = storage.getItem('hasDocumentsForUsers');
            var users = !!usersJSON && JSON.parse(usersJSON);
            var index;

            if (!(users instanceof Array)) users = [];

            index = users.indexOf(user);

            if (data.action === 'add' && index < 0) {
                users.push(user);
            } else if (data.action === 'remove' && index >= 0) {
                users.splice(index, 1);
            }

            storage.setItem('hasDocumentsForUsers', JSON.stringify(users));
        }

        function getFilesByUserId(id) {
            console.warn('getFilesByUserId() for id >>>', id);
            if (!vm.path) return $q.when(getDocuments(true));

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

                    function readFolder() {
                        var q = $q.defer();

                        // Keep calling readEntries() until no more results are returned.
                        function readEntries() {
                            dirReader.readEntries(
                                function (results) {
                                    console.log('results from dirReader: ', results);
                                    if (results.length) {
                                        console.log('dirReader Length' + results.length);
                                        entries = entries.concat(toArray(results));
                                        readEntries();
                                    } else {
                                        console.log('dirReader trying to resolve docs: ' + JSON.stringify(entries));
                                        resolveDocuments(entries)
                                            .then(function (entries) {
                                                console.log('dirReader resolving with entries: ', entries);
                                                q.resolve(entries);
                                            })
                                            .catch(function (err) {
                                                console.error('dirReader failed to resolve entries: ' + JSON.stringify(entries) + ' err: ' + err);
                                                q.reject(err);
                                            });
                                    }
                                },
                                function (err) {
                                    console.error('Failed to read Directory', err);
                                    q.reject(err);
                                });
                        }

                        readEntries();

                        return q.promise;
                    }

                    function toArray(list) {
                        return Array.prototype.slice.call(list || [], 0);
                    }

                    function resolveDocuments(entries) {
                        var docsPromises = [];

                        angular.forEach(entries, function (entry) {
                            docsPromises.push(createDocumentPromise(entry));
                        });

                        return $q.all(docsPromises).then(function (resolvedDocuments) {
                            
                            // Itereate and add to avoid ovrewriting stubs
                            _.each(resolvedDocuments, function (doc) {
                                addDocument(doc);
                            });

                            return vm.documents;
                        });
                    }

                    return readFolder();
                })
                .catch(function () {
                    if (!!hasLockbox) {
                        return $q.when(getDocuments(true));
                    } else {
                        return $cordovaFile.createDir(path, "lockbox", false).then(function () {
                            return $q.when(getDocuments(true));
                        });
                    }
                    return $q.when(vm.documents);
                })
                .finally(function () {
                    var hasRealDoc = _.some(vm.documents, function (doc) { return !!doc.id });
                    if (!hasRealDoc) {
                        welcomeService.initialize('lockbox.add');
                    }
                    console.warn('getFilesByUserId() finally vm.documents >>>', vm.documents);
                    $ionicLoading.hide();
                });
        }

        function createDocumentPromise(entry) {
            var deferred = $q.defer();
            var entryExtension = entry.name.split('.').pop();
            var userID = vm.userData.id;
            var path = vm.LOCKBOX_FOLDER + '/' + userID;
            var docObject;

            if (entryExtension === 'txt') {
                $cordovaFile.readAsText(path, entry.name).then(function (data) {
                    docObject = parseDocFromFilename(entry.name);

                    docObject.url = data;
                    docObject.user = userID;

                    deferred.resolve(docObject);
                }, function (err) {
                    deferred.reject(err)
                });
            } else {
                docObject = parseDocFromFilename(entry.name);

                docObject.url = entry.nativeURL;
                docObject.user = userID;

                deferred.resolve(docObject);
            }
            return deferred.promise;
        }

        function renameLocalFile(doc, data) {
            var userID = getUserId(doc);
            var path = vm.LOCKBOX_FOLDER + '/' + userID;
            var oldName = doc.id + '-' + getFileName(doc);
            var newName = doc.id + '-' + getFileName(data);

            return $cordovaFile.moveFile(path, oldName, path, newName);
        }

        function parseDocFromFilename(filename) {
            var params = filename.split('-');
            var doc = {};
            var i = 0;

            doc.id = params[i++];
            if (params.length === 3) {
                doc.sku = params[i++];
            }
            doc.name = getDisplayName(params[i++]);

            return doc;
        }

        function getFileName(source) {
            var hasExtension = source.name.lastIndexOf('.') >= 0;
            return source.sku + '-' + source.name.replace('/ /g', '_') + (!hasExtension ? '.txt' : '');
        }

        function getDisplayName(source) {
            return source.replace('/_/g', ' ');
        }

        function updateDocumentList() {
            return vm.documents;
        }

        function getId(e) { return e.id || e._id; }

        function getUserId(doc) {
            return angular.isObject(doc.user) && doc.user.id || doc.user || vm.userData.id;
        }

    }

    /** Documnt Stubs
     * These stub documents are in place to provide placeholders for users
     * so that they have a better idea how to use the app.
     */
    var docTypeDefinitions = [
        {
            sku: 'reports',
            name: 'MVR and Background Checks',
            action: 'Order',
            fn: 'orderDocs'
        },
        {
            sku: 'res',
            name: 'Professional Resume'
        },
        {
            sku: 'cdl',
            name: 'Driver License',
            info: ''
        },
        {
            sku: 'misc',
            multi: true,
            name: 'other document ...',
            info: ''
        }
    ];

})();
