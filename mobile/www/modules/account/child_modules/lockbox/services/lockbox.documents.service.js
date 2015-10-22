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
        try{
            vm.path = cordova.file.documentsDirectory; // ionic.Platform.isIOS() ? vm.IOS_PATH : vm.ANDROID_PATH;
            vm.LOCKBOX_FOLDER = vm.path + 'lockbox/';
        } catch (err) {
            console.warn('no cordova available, can\'t get access to documentsDirectory and lockbox folder');
        }

        vm.userData = userService.profileData;
        vm.documents = [];

        function getId(e) { return e.id || e._id; }

        // TODO: Refactor to be "refresh documents"
        function getDocuments(saveToDevice) {
            //return $http.get(settings.documents).then(
            return API.doRequest(settings.documents, 'get')
                .then(function success(documentListResponse) {
                    var docs = documentListResponse.data;

                    if(!vm.path) return $q.when(docs);

                    var promiseArr = [];

                    if(!docs || !docs.length) return [];

                    angular.forEach(docs, function (doc) {
                        if (saveToDevice) {
                            // NOTE: This returns a promise and the file may not be fully saved
                            // to the device when teh method returns

                            if(doc.url.indexOf('data:image') !== -1){
                                saveFileToDevice(doc);
                                promiseArr.push($q.when(doc));
                            }else{
                                promiseArr.push(saveExistingFiles(doc));
                            }
                        }
                    });

                    return $q.all(promiseArr);
                })
                .then(function (newDocuments) {
                    var id, name, url, user;
                    if(angular.isArray(newDocuments) && newDocuments.length){
                        angular.forEach(newDocuments, function(doc){
                            if(!doc.id && doc.name && doc.nativeURL){
                                id = doc.name.split('-')[0];
                                name = doc.name.split('-')[1].replace('_', ' ');
                                user = angular.isObject(doc.user) && doc.user.id || doc.user;
                                url = doc.nativeURL
                            }else{
                                id = doc.id;
                                name = doc.name;
                                user = angular.isObject(doc.user) && doc.user.id || doc.user;
                                url = doc.url;
                            }

                            addDocument( {name: name, url: url, id: id, user: user} );
                        });
                    }else if (angular.isArray(newDocuments) && !newDocuments.length){
                        vm.documents = newDocuments || [];
                    }
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

        function updateNewDocumentWithID (doc) {
            var i = _.findIndex(vm.documents, { url: doc.url, name: doc.name });
            if(i >= 0 && vm.documents[i]){
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
                    if(!vm.path) return _.extend(doc, data);
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
            var path = vm.path;

            updateNewDocumentWithID(file);

            return $cordovaFile.checkDir(path, 'lockbox')
                .catch(function () {
                    return $cordovaFile.createDir(path, "lockbox", false);
                })
                .then(function () {
                    var options = {
                        path: path + 'lockbox/',
                        user: angular.isObject(file.user) ? file.user.id : file.user,
                        name: file.id + '-' + getFileName(file),
                        data: file.url
                    };
                    return writeFileInUserFolder(options);
                });
        }

        function saveExistingFiles (doc) {
            var extension = doc.url.split('.').pop();
            var id = doc.id;
            var name = id + "-" + doc.name.replace(' ', '_') + '.' + extension;
            var path = vm.LOCKBOX_FOLDER + vm.userData.id + '/' + name;

            return $cordovaFileTransfer
                .download(doc.url, path, {}, true);
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
                    console.warn(' created file --->>>', file);
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
                .then(function (path) {
                    return $cordovaFile.removeRecursively(path, user)
                }, function (err) {
                    return $q.reject(err)
                })
                .then(function () {
                    return updateStorageInfo(user, {action: 'remove'});
                }, function (err) {
                    console.error(' user Documents are not removed. error --->>>', err);
                });
        }

        function removeOneDocument (doc) {
            if(!doc) return;

            var path = vm.LOCKBOX_FOLDER,
                userID = angular.isObject(doc.user) && doc.user.id || doc.user || doc.userId  || vm.userData.id,
                documentName = doc.id + '-' + getFileName(doc);

            return $cordovaFile.checkDir(path, userID)
                .then(function (dir) {
                    path += userID;
                    console.warn('removeOneDoc dir >>>', dir);
                    console.warn(' path >>>', path);
                    return $cordovaFile.removeFile(path, documentName);
                })
                .catch(function (err) {
                    console.warn(' err --->>>', err);
                });
        }

        function updateStorageInfo (user, data) {
            var storage = $window.localStorage;
            var usersJSON = storage.getItem('hasDocumentsForUsers');
            var users = !!usersJSON && JSON.parse(usersJSON);
            var index;

            if(!(users instanceof Array)) users = [];

            index = users.indexOf(user);

            if(data.action === 'add' && index < 0) {
                users.push(user);
            } else if (data.action === 'remove' && index >= 0) {
                users.splice(index, 1);
            }

            storage.setItem('hasDocumentsForUsers', JSON.stringify(users));
        }

        function getFilesByUserId (id) {
            if(!vm.path) return $q.when(getDocuments(true));

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
                });
        }

        function createDocumentPromise (entry) {
            var deferred = $q.defer();
            var entryExtension = entry.name.split('.').pop();
            var userID = vm.userData.id;
            var path = vm.LOCKBOX_FOLDER + '/' + userID;
            var docObject, params;

            if(entryExtension === 'txt'){
                $cordovaFile.readAsText(path, entry.name).then(function (data) {
                    params = entry.name.split('-');

                    docObject = {};
                    docObject.id = params[0];
                    docObject.name = params[1].replace('_', ' ').replace('.txt', '');
                    docObject.url = data;
                    docObject.user = userID;

                    deferred.resolve(docObject);
                }, function(err){
                    deferred.reject(err)
                });
            }else{
                params = entry.name.split('-');

                docObject = {};
                docObject.id = params[0];
                docObject.name = params[1].replace('_', ' ');
                docObject.url = entry.nativeURL;

                deferred.resolve(docObject);
            }
            return deferred.promise;
        }

        function renameLocalFile (doc, data) {
            var userID = angular.isObject(doc.user) && doc.user.id || doc.user || vm.userData.id;
            var path = vm.LOCKBOX_FOLDER + '/' + userID;
            var oldName = doc.id + '-' + getFileName(doc);
            var newName = doc.id + '-' + getFileName(data);

            return $cordovaFile.moveFile(path, oldName, path, newName);
        }

        function getFileName (source) {
            var hasExtension = source.name.lastIndexOf('.') >= 0;
            return source.name.replace(' ', '_') + (!hasExtension ? '.txt' : '');
        }

        function updateDocumentList () {
            return vm.documents;
        }


        //////////////////// Save Methods ////////////////////

        //////////////////// Retrieve Methods ////////////////////

        //////////////////// Remove Mehtods ////////////////////

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
            updateDocumentList: updateDocumentList
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
