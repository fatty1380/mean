(function() {
    'use strict';

    angular.module('lockbox').filter('getById', function() {
        return function(input, id) {
            var i = 0;
            var len = input.length;
            for (; i < len; i++) {
                if (+input[i].id === +id) {
                    return input[i];
                }
            }
            return null;
        };
    });

    angular
        .module('lockbox')
        .service('lockboxDocuments', lockboxDocuments);

    lockboxDocuments.$inject = ['$cordovaFileTransfer', '$window', '$cordovaFile', '$ionicActionSheet', '$ionicPlatform', '$q', 'LoadingService',
        'userService', 'API', 'settings', 'cameraService', 'lockboxModalsService', 'welcomeService', 'lockboxSecurity'];

    function lockboxDocuments($cordovaFileTransfer, $window, $cordovaFile, $ionicActionSheet, $ionicPlatform, $q, LoadingService,
        userService, API, settings, cameraService, lockboxModalsService, welcomeService, lockboxSecurity) {

        var vm = this;


        $ionicPlatform.ready(function(e) {
            try {
                vm.path = cordova.file.documentsDirectory;
                vm.LOCKBOX_FOLDER = vm.path + 'lockbox/';
            }
            catch (err) {
                logger.warn('no cordova available, can\'t get access to documentsDirectory and lockbox folder');
            }
        });

        vm.userData = userService.profileData;
        vm.documents = copyArray(docTypeDefinitions);

        return {
            loadDocuments: loadDocsFromServer,
            loadLocalDocsForUser: loadLocalDocsForUser,
            addDocsPopup: addDocsPopup,
            removeDocuments: removeDocuments,
            removeOtherUserDocuments: removePrevUserDocuments,
            updateDocument: updateDocument,
            writeFileInUserFolder: writeFileInUserFolder,
            removeDocumentsByUser: removeDocumentsByUser,
            getDocumentList: getDocumentList,
            orderReports: orderReports,
            newDocPopup: takePicture,
            checkAccess: lockboxSecurity.checkAccess,
            clear: clear
            // getStubDocuments: getStubDocuments
        };

        function clear() {
            vm.documents = copyArray(docTypeDefinitions);
            vm.userData = null;
        }

        // TODO: Refactor to be "refresh documents"
        function loadDocsFromServer(saveToDevice) {
            vm.userData = userService.profileData;

            if (_.isEmpty(vm.userData)) {
                return $q.reject('No user is logged in');
            }

            // return lockboxSecurity.checkAccess(options)
            //     .then(function (hasAccess) {

            //         if (hasAccess) {
            //             LoadingService.showLoader('Loading Documents');

            //             return API.doRequest(settings.documents, 'get');
            //         }

            //         return $q.reject('No Access');
            //     })


            LoadingService.showLoader('Loading Documents');

            return API.doRequest(settings.documents, 'get')
                .then(function success(documentListResponse) {
                    var docs = documentListResponse.data;

                    if (!vm.path) {
                        // Not Saving to Device - return docs directly
                        return docs;
                    }
                    if (_.isEmpty(docs)) {
                        // No Docs - Resolve w/ empty array
                        return [];
                    }

                    // var dcs = [docs.shift()];
                    // while (!/^https?:/i.test(dcs[0].url)) {
                    //     dcs = [docs.shift()];
                    // }
                    // logger.error('HARDCODED DOWNLOAD OF SINGLE DOCUMENT', dcs[0]);
                    // docs = dcs;
                    
                    var promises = _.map(docs, function(doc) {
                        if (saveToDevice) {
                            // NOTE: This returns a promise and the file may not be fully saved
                            // to the device when teh method returns

                            if (/data:\w+\//i.test(doc.url)) {
                                logger.debug('Doc is `data` ... saving directly');
                                // If the URL is a URI (eg: 'data:image/jpeg'), save it directly to the device
                                return $q.when(saveFileToDevice(doc));
                            }
                            else if (/^https?:/i.test(doc.url)) {
                                // Otherwise, we can assume that the URL is a URL and must be Downloaded
                                logger.debug('Doc is `http` ... downloading');
                                return downloadAndSaveDocumentToDevice(doc)
                                    .catch(function(err) {
                                        logger.error('direct catch', err);
                                    });
                            }

                            return $q.reject('Unknown URL Type: `%s`', doc.url && doc.url.substring(0, 10));
                        }

                        logger.debug('Not saving doc to device ... continuing');                        
                        return $q.when(doc);
                    });

                    return $q.all(promises);
                })
                .then(function(newDocuments) {
                    var id, sku, name, url, user, created;

                    if (!_.isEmpty(newDocuments)) {
                        _.each(newDocuments, function(doc) {
                            if (!doc) { 
                                logger.debug('No Doc, no Go');
                                return; }

                            // No ID, With Name and Native FS URL
                            if (!doc.id && doc.name && doc.nativeURL) {
                                logger.debug('No Doc ID for doc name: ', doc.name, doc.nativeURL);
                                var docObject = parseDocFromFilename(doc.name);

                                id = docObject.id;
                                sku = docObject.sku;
                                name = docObject.name;
                                url = doc.nativeURL;
                            }
                            else {
                                logger.debug('Standard processing: ', doc.name, doc.nativeURL);

                                id = doc.id;
                                sku = doc.sku;
                                name = doc.name;
                                url = doc.nativeURL || doc.url; // Use Local URL if available...
                            }

                            logger.debug('Continuing with the doc creation ...');
                            
                            user = getUserId(doc);
                            created = doc.created;

                            var ledoc = {
                                name: name,
                                url: url,
                                id: id,
                                user: user,
                                created: created,
                                sku: doc.sku
                            };

                            logger.debug('prep doc add', ledoc);                        
                            addDocument(ledoc);
                        });
                    }

                    return vm.documents;
                })
                .catch(function(result) {
                    if (/No Access/i.test(result)) {
                        logger.error('no access to docs');

                        return $q.reject(result);
                    }

                    logger.error('Error getting docs: ', result);
                    return vm.documents;
                })
                .finally(function() {
                    var hasRealDoc = _.some(vm.documents, function(doc) { return !!doc.id; });
                    if (!hasRealDoc) {
                        welcomeService.initialize('lockbox.add');
                    }

                    logger.warn('finally vm.documents >>>', vm.documents);
                    LoadingService.hide();
                });
        }


        function loadLocalDocsForUser(userId) {

            vm.userData = userService.profileData;

            if (_.isEmpty(vm.userData)) {
                return $q.reject('No user is logged in');
            }

            logger.warn('loadLocalDocsForUser() for id >>> @ path `%s`', vm.path, userId);
            if (!vm.path) { return $q.when(loadDocsFromServer(true)); }


            LoadingService.showLoader('Loading Documents');

            var path = vm.path;
            var hasLockbox = false;

            return $cordovaFile.checkDir(path, 'lockbox')
                .then(function() {
                    path += 'lockbox/';
                    hasLockbox = true;

                    return $cordovaFile.checkDir(path, userId);
                })
                .then(function(dir) {
                    logger.debug('[LockboxDocsService] directory >>> ', dir);
                    path += userId;
                    return readFolder(dir);
                })
                .then(function(entries) {
                    logger.debug('[LockboxDocsService] entries >>> ', entries);

                    return vm.documents;
                })
                .catch(function(err) {
                    logger.error('[LockboxDocsService] loadLocalDocsForUser', err);
                    if (!!hasLockbox) {
                        logger.debug('[LockboxDocsService] loadLocalDocsForUser : calling getDocuments');
                        return $q.when(loadDocsFromServer(true, { redirect: true }));
                    } else {
                        return $cordovaFile.createDir(path, 'lockbox', false).then(function() {
                            return $q.when(loadDocsFromServer(true));
                        });
                    }
                    return $q.when(vm.documents);
                })
                .finally(function() {
                    var hasRealDoc = _.some(vm.documents, function(doc) { return !!doc.id; });
                    if (!hasRealDoc) {
                        welcomeService.initialize('lockbox.add');
                    }
                    logger.warn('loadLocalDocsForUser() finally vm.documents >>>', vm.documents);
                    LoadingService.hide();
                });
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
                cancel: function() {
                    deferred.reject({ error: false, message: 'Action Sheet Cancelled' });
                },
                buttonClicked: function(index) {
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
            return API.doRequest(settings.documents + doc.id, 'put', data)
                .then(function() {
                    if (!vm.path) { return _.extend(doc, data); }
                    return renameLocalFile(doc, data);
                })
                .then(function() {
                    return _.extend(doc, data);
                })
                .catch(function(err) {
                    logger.error(' err --->>>', err);
                });
        }

        function takePicture(sku) {

            return welcomeService.showModal('lockbox.add')
                .then(function() {
                    return cameraService.showActionSheet();
                })
                .then(function success(rawImageResponse) {
                    return lockboxModalsService.showCreateModal({ image: rawImageResponse, sku: sku });
                })
                .then(function success(newDocumentObject) {
                    return lockboxSecurity.checkAccess({ setNew: true })
                        .then(function(accessStatus) {
                            if (accessStatus !== -1 && accessStatus) {
                                return newDocumentObject;
                            }

                            logger.error('[lockboxService.addDocument] No Access to lockbox, not saving');

                            LoadingService.showFailure('Please enter a PIN to secure your lockbox before saving Documents');
                            throw new Error('Lockbox is not secured');
                        });
                })

                .then(function success(newDocumentObject) {
                    if (addDocument(newDocumentObject)) {
                        return API.doRequest(settings.documents, 'post', newDocumentObject);
                    }
                    return API.doRequest(settings.documents + newDocumentObject.id, 'put', newDocumentObject);
                })
                .then(function saveSuccess(newDocumentResponse) {
                    // TODO: Is this a sync or async call?
                    saveFileToDevice(newDocumentResponse.data);

                    if (newDocumentResponse.status !== 200) {
                        logger.warn('Unknown Error in Doc Save response: ', newDocumentResponse);
                    }

                    LoadingService.showSuccess('Saved Document');

                    return newDocumentResponse.data;
                })
                .catch(function reject(err) {
                    logger.error('Failed to save new doc: ', err);

                    if (!!sku) {
                        return _.find(vm.documents, { sku: sku });
                    }

                    return null;
                })
                .finally(function() {
                    LoadingService.hide();
                });
        }

        function orderReports() {
            lockboxModalsService
                .showOrderReportsModal();
        }

        /**
         * Iterates over all stored documents in the lockbox (per local storage)
         * and removes any documents that are not the newly logged in user's
         */
        function removePrevUserDocuments(id) {
            var storage = $window.localStorage;
            var usersJSON = storage.getItem('hasDocumentsForUsers');
            var users = usersJSON && angular.fromJson(usersJSON);

            if (!users || !(users instanceof Array) || !users.length) return;

            var removals = users.map(function(user) {
                if (user !== id) {
                    logger.warn('removing documents for user --->>>', user);
                    return removeDocumentsByUser(user);
                }

                return $q.resolve(null);
            });

            return $q.all(removals).then(
                function removalSuccess(result) {
                    var removed = _.omit(removals, _.isEmpty);

                    logger.info('Removed user\'s documents', removed);
                    logger.info('Documents users >>>', users);

                    return storage.setItem('hasDocumentsForUsers', angular.toJson(users));
                })
                .catch(
                function removalFail(err) {
                    logger.error('Failed to remove all user documents due to error', err);
                    return null;
                });

        }

        function removeDocuments(documents) {


            var promises = _.map(documents, function(doc) {
                logger.debug('[LockboxDocsService] Removing Doc: %s w/ ID: %s ', doc.sku, doc.id);


                return API.doRequest(settings.documents + doc.id, 'delete')
                    .catch(function fail(err) {
                        if (err.status === 404) {
                            logger.debug('document not found on server', err);
                            return;
                        }
                        logger.error('failed to delete documents ', err);
                        throw err;
                    })
                    .then(function(success) {
                        _.remove(vm.documents, { id: doc.id });
                        return removeOneDocument(doc);
                    })
                    .then(function(success) {
                        var stub = _.find(docTypeDefinitions, { sku: doc.sku });
                        var alreadyHasStub = _.find(vm.documents, { sku: doc.sku });
                        if (!!stub && !alreadyHasStub) {
                            addDocument(stub);
                        }
                    })
                    .catch(function fail(err) {
                        logger.error('failed to delete documents ', err);
                    });




            });

            return $q.all(promises);
        }

        /**
        * downloadAndSaveDocumentToDevice
        * Given a document defined by a URL, downloads the doucment and saves it to the device
        */
        function downloadAndSaveDocumentToDevice(doc) {
            var id = doc.id;
            var name = id + '-' + getFileName(doc);
            var path = vm.LOCKBOX_FOLDER + vm.userData.id + '/' + name;

            logger.debug('Downloading document from `%s` and saving to `%s`', doc.url, path);

            return $cordovaFileTransfer
                .download(doc.url, path, { encodeURI: false }, true)
                .then(function success(entry) {
                    logger.debug('Downloaded and saved doc `%s`', id);

                    var temp = { name: doc.name };
                    return _.extend(doc, entry, temp);
                })
                .catch(function fail(err) {
                    logger.error('Error downloading doc `%s`', id, err);

                    return doc;
                });


            // var deferred = $q.defer();
            // $cordovaFileTransfer
            //     .download(doc.url, path,
            //         function success (entry) {
            //             deferred.resolve(entry);
            //         },
            //         function error (err) {
            //             logger.error(err, 'Error Downloading doc id ' + id);
            //             deferred.reject('Failed to Download File');
            //         },
            //         true);

            // return deferred.promise;
        }

        /**
         * saveFileToDevice
         * Give a 'document' defined as a URI, saves the document contents to the device
         */
        function saveFileToDevice(file) {
            var path = vm.path;

            updateNewDocumentWithID(file);

            return $cordovaFile.checkDir(path, 'lockbox')
                .catch(function() {
                    return $cordovaFile.createDir(path, 'lockbox', false);
                })
                .then(function() {
                    var options = {
                        path: path + 'lockbox/',
                        user: getUserId(file),
                        name: file.id + '-' + getFileName(file),
                        data: file.url,
                        sku: file.sku
                    };
                    return writeFileInUserFolder(options);
                    // writeFileInUserFolder Returns promise CONFIRMED
                });
        }


        /**
         * @returns : promise
         * @resolves with: the newly wirtten file object
         */
        function writeFileInUserFolder(options) {
            var path = options.path;
            var user = options.user;
            var name = options.name;
            var data = options.data;

            return $cordovaFile
                .checkDir(path, user)
                .catch(function() {
                    return $cordovaFile.createDir(path, user, false);
                })
                .then(function() {
                    path += user;
                    return $cordovaFile.writeFile(path, name, data, true);
                })
                .then(function(file) {
                    updateStorageInfo(user, { action: 'add' });
                    return file;
                })
                .catch(function(err) {
                    logger.error('writeFileInUserFolder err >>>', err);
                });
        }

        function removeDocumentsByUser(user) {
            var path = vm.LOCKBOX_FOLDER;

            return $cordovaFile.checkDir(path, user)
                .then(function(docDirectoryEntryObj) {
                    logger.debug('[LockboxDocsService] Lockbox: Removing Documents for User ' + user + ' at path: ', docDirectoryEntryObj);
                    return $cordovaFile.removeRecursively(docDirectoryEntryObj.nativeURL, user);
                }, function(err) {
                    return $q.reject(err);
                })
                .then(function() {
                    return updateStorageInfo(user, { action: 'remove' });
                }, function(err) {
                    logger.error(' user Documents are not removed. error --->>>', err);
                });
        }

        function removeOneDocument(doc) {
            logger.warn(' removeOneDocument() doc >>>', doc);
            if (!doc) return;

            var sku = doc.sku;

            var path = vm.LOCKBOX_FOLDER,
                userID = getUserId(doc),
                documentName = doc.id + '-' + getFileName(doc);

            return $cordovaFile.checkDir(path, userID)
                .then(function(dir) {
                    path += userID;
                    var docPath = userID + '/' + documentName;
                    return $cordovaFile.removeFile(path, documentName);
                })
                .then(function(res) {
                })
                .catch(function(err) {
                    logger.warn(' remove doc err --->>>', err);
                });
            // .finally(function() {
            //     // TODO: Restore deleted document from stubs *IF* the deleted document sku matches a non-multi docTypeDefinition
            // });
        }

        function updateStorageInfo(user, data) {
            var storage = $window.localStorage;
            var usersJSON = storage.getItem('hasDocumentsForUsers');
            var users = !!usersJSON && angular.fromJson(usersJSON);
            var index;

            if (!_.isArray(users)) { users = []; }

            index = users.indexOf(user);

            if (data.action === 'add' && index < 0) {
                users.push(user);
            } else if (data.action === 'remove' && index >= 0) {
                users.splice(index, 1);
            }

            storage.setItem('hasDocumentsForUsers', angular.toJson(users));
        }



        // ////// Methods ///////////////////////////////////////////////////////////////

        function addDocument(doc) {
            if (_.isEmpty(doc.sku + doc.id + doc.url)) {
                return false;
            }
            var i = -1;
            var sku = (doc.sku || 'misc').toLowerCase();



            var def = _.find(docTypeDefinitions, { sku: doc.sku }) || {};
            var order = def.order || vm.documents.length;
            doc.order = order !== 99 ? order : vm.documents.length;

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
                logger.debug('[LockboxDocsService] Pushing doc into docs', doc, vm.documents);
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

        function copyArray(list) {
            return Array.prototype.slice.call(list || [], 0);
        }

        /**
         * Given a directory, reads through it and resolves teh documents in it.
         */
        function readFolder(directory) {

            var dirReader = directory.createReader();
            var entries = [];

            var q = $q.defer();

            // Keep calling readEntries() until no more results are returned.
            function readEntries() {
                dirReader.readEntries(
                    function success(results) {
                        logger.debug('[LockboxDocsService] dirReader.readEntries results: %d entries: %d', results && results.length, entries.length);
                        if (results.length) {
                            logger.debug('[LockboxDocsService] dirReader Length ' + results.length);

                            entries = entries.concat(_.isArray(results) ? results : Array(results));
                            readEntries();
                        }
                        else {
                            // logger.debug('[LockboxDocsService] dirReader trying to resolve docs: ' + angular.toJson(entries));
                            resolveDocuments(entries)
                                .then(function(entries) {
                                    logger.debug('[LockboxDocsService] dirReader resolving with entries: ', entries);
                                    q.resolve(entries);
                                })
                                .catch(function(err) {
                                    logger.error('dirReader failed to resolve entries: ' + angular.toJson(entries) + ' err: ' + err);
                                    q.reject(err);
                                });
                        }
                    },
                    function fail(err) {
                        logger.error('Failed to read Directory', err);
                        q.reject(err);
                    });
            }

            readEntries();

            return q.promise;
        }


        function resolveDocuments(entries) {

            logger.debug('[LockboxDocsService] looking  at %d documents to resolve', entries && entries.length || 0);

            var docsPromises = [];
            _.each(entries, function(entry) {
                docsPromises.push(createDocumentPromise(entry));
            });

            return $q.all(docsPromises)
                .then(function(resolvedDocuments) {

                    // Itereate and add to avoid ovrewriting stubs
                    _.each(resolvedDocuments, function(doc) {
                        addDocument(doc);
                    });

                    return vm.documents;
                });
        }

        function createDocumentPromise(entry) {
            var deferred = $q.defer();
            var entryExtension = entry.name.split('.').pop();
            var userID = vm.userData.id;
            var path = vm.LOCKBOX_FOLDER + '/' + userID;
            var docObject;

            if (entryExtension === 'txt') {
                $cordovaFile.readAsText(path, entry.name).then(function(data) {
                    docObject = parseDocFromFilename(entry.name);

                    docObject.url = data;
                    docObject.user = userID;

                    deferred.resolve(docObject);
                }, function(err) {
                    deferred.reject(err);
                });
            }
            else {
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
            var extensionMatcher = /.*(\.\w{3,4})/;
            var extension = '.txt';

            if (extensionMatcher.test(source.key)) {
                extension = source.key.match(extensionMatcher).pop();
            }
            else if (extensionMatcher.test(source.name)) {
                extension = source.name.match(extensionMatcher).pop();
            }
            else if (extensionMatcher.test(source.url)) {
                extension = source.url.match(extensionMatcher).pop();
            }

            if (/\?\*\/]/g.test(source.name)) { debugger; }
            var fname = source.name.replace(/[ \?\*\/]/g, '_');

            return source.sku + '-' + fname + extension;
        }

        function getDisplayName(source) {
            return source.replace(/_/g, ' ').replace(/\.\w{3,4}$/, '');
        }

        function getDocumentList() {
            return vm.documents;
        }

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
            name: 'MVR & Background Checks',
            action: 'Order',
            fn: 'orderDocs',
            order: 0
        },
        {
            sku: 'cdl',
            name: 'Commercial Driver License',
            info: '',
            order: 2
        },
        {
            sku: 'res',
            name: 'Resume',
            info: '',
            order: 1
        },
        {
            sku: 'ins',
            name: 'Insurance',
            info: '',
            order: 3
        },
        {
            sku: 'misc',
            multi: true,
            icon: 'ion-plus',
            info: '',
            order: 99
        }
    ];

})();

