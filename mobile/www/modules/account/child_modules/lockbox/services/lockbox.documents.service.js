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

    lockboxDocuments.$inject = ['$cordovaFileTransfer', '$window', '$cordovaFile', '$ionicActionSheet', '$q', '$ionicLoading',
        'userService', 'API', 'settings', 'cameraService', 'lockboxModalsService', 'welcomeService', 'lockboxSecurity'];

    function lockboxDocuments($cordovaFileTransfer, $window, $cordovaFile, $ionicActionSheet, $q, $ionicLoading,
        userService, API, settings, cameraService, lockboxModalsService, welcomeService, lockboxSecurity) {

        var vm = this;

        try {
            vm.path = cordova.file.documentsDirectory;
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
            writeFile: writeFile,
            getFilesByUserId: getFilesByUserId,
            updateDocumentList: updateDocumentList,
            orderReports: orderReports,
            newDocPopup: takePicture,
            checkAccess: lockboxSecurity.checkAccess,
            clear: clear
            //getStubDocuments: getStubDocuments
        }
        
        function clear() {
            vm.documents = docTypeDefinitions;
            vm.userData = null;
        }
        
        // TODO: Refactor to be "refresh documents"
        function getDocuments(saveToDevice) {
            if (_.isEmpty(vm.userData)) {
                return $q.reject('No user is logged in');
            }
            
            return lockboxSecurity.checkAccess()
                .then(function (hasAccess) {

                    if (hasAccess) {
                        return API.doRequest(settings.documents, 'get')
                    }

                    return $q.reject('No Access');
                })
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

                    var promises = _.map(docs, function (doc) {
                        if (saveToDevice) {
                            // NOTE: This returns a promise and the file may not be fully saved
                            // to the device when teh method returns

                            if (doc.url.indexOf('data:image') !== -1) {
                                saveFileToDevice(doc);
                                return $q.when(doc);
                            } else {
                                return saveExistingFiles(doc);
                            }
                        }
                    });

                    return $q.all(promises);
                })
                .then(function (newDocuments) {
                    var id, sku, name, url, user, created;

                    if (!_.isEmpty(newDocuments)) {
                        _.each(newDocuments, function (doc) {
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


        function getFilesByUserId(id) {
            if (_.isEmpty(vm.userData)) {
                return $q.reject('No user is logged in');
            }

            console.warn('getFilesByUserId() for id >>>', id);
            if (!vm.path) return $q.when(getDocuments(true));

            var path = vm.path;
            var hasLockbox = false;
            var hasUserDir = false;

            return lockboxSecurity.checkAccess()
                .then(function (result) {
                    if (result.hasAccess) {
                        return $cordovaFile.checkDir(path, 'lockbox')
                    }

                    return $q.reject('No Access');
                })
                .then(function () {
                    path += 'lockbox/';
                    hasLockbox = true;

                    return $cordovaFile.checkDir(path, id);
                })
                .then(function (dir) {
                    path += id;
                    hasUserDir = true;

                    return readFolder(dir);
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
                    } else {
                        return API.doRequest(settings.documents + newDocumentObject.id, 'put', newDocumentObject, false);
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
            var promises = _.map(documents, function (doc) {
                console.log('Removing Doc: %s w/ ID: %s ', doc.sku, doc.id);

                _.remove(vm.documents, { id: doc.id });
                removeOneDocument(doc);

                var stub = _.find(docTypeDefinitions, { sku: doc.sku });
                var alreadyHasStub = _.find(vm.documents, { sku: doc.sku });

                if (!!stub && !alreadyHasStub) {
                    addDocument(stub);
                }

                //return API.doRequest(settings.documents + doc.id, 'delete');
                return API.doRequest(settings.documents + doc.id, 'delete');
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

            if (!_.isArray(users)) { users = [];}

            index = users.indexOf(user);

            if (data.action === 'add' && index < 0) {
                users.push(user);
            } else if (data.action === 'remove' && index >= 0) {
                users.splice(index, 1);
            }

            storage.setItem('hasDocumentsForUsers', JSON.stringify(users));
        }

        
        
        //////// Methods ///////////////////////////////////////////////////////////////

        function toArray(list) {
            return Array.prototype.slice.call(list || [], 0);
        }

        function readFolder(directory) {

            var dirReader = directory.createReader();
            var entries = [];

            var q = $q.defer();

            // Keep calling readEntries() until no more results are returned.
            function readEntries() {
                var reader = dirReader.readEntries(
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
                    
                debugger; // Check 'reader'
            }

            readEntries();

            return q.promise;
        }


        function resolveDocuments(entries) {
            var docsPromises = angular.map(entries, function (entry) {
                return createDocumentPromise(entry);
            });

            return $q.all(docsPromises)
                .then(function (resolvedDocuments) {
                            
                    // Itereate and add to avoid ovrewriting stubs
                    _.each(resolvedDocuments, function (doc) {
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


    angular
        .module('lockbox')
        .factory('lockboxSecurity', lockboxSecurity);

    lockboxSecurity.$inject = ['$rootScope', '$state', '$ionicPopup', '$ionicLoading', '$q', 'securityService'];
    function lockboxSecurity($rootScope, $state, $ionicPopup, $ionicLoading, $q, securityService) {

        return {
            checkAccess: checkAccess
        };

        function checkAccess(options) {
            // TODO: refactor and move to service
            // Step 1: Pulled out into standalone function
            
            options = _.defaults({}, options, {
                redirect: true,
                setNew: true
            })

            var $scope = $rootScope.$new();

            $scope.data = {
                title: 'Enter New PIN',
                subTitle: 'Secure your Lockbox with a 4 digit PIN'
            };

            var scopeData = $scope.data;
            var state = securityService.getState();
            var PIN;

            var pinPopup;
            scopeData.closePopup = closePINPopup;
            scopeData.pinChange = pinChanged;
            
            /////////////////////////////////////////////
            
            return securityService
                .getPin()
                .then(function (pin) {
                    PIN = pin;
                    state = securityService.getState();

                    if (!!state.secured) {
                        scopeData.title = 'Enter PIN';
                        scopeData.subTitle = 'Enter your PIN to unlock'
                    }
                    else if (!state.secured && !options.setNew) {
                        return $q.reject('Lockbox not secured and securing is disabled');
                    }

                })
                .then(function () {
                    if (!state.accessible) {
                        $ionicLoading.hide();
                        return (pinPopup = $ionicPopup.show(getPinObject()));
                    }

                    return state.accessible;
                })
                .then(function (accessGranted) {
                    if (!accessGranted && options.redirect) {
                        $state.go('account.profile');
                        return false;
                    }
                    
                    return !!accessGranted;
                })
                .finally(function () {
                    $ionicLoading.hide();
                });

            function getPinObject() {
                return {
                    template: '<input class="pin-input" type="tel" ng-model="data.pin" ng-change="data.pinChange(this)" maxlength="4" autofocus>',
                    title: scopeData.title,
                    subTitle: scopeData.subTitle,
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel', type: 'button-small' }
                    ]
                };
            }

            function closePINPopup(data) {
                pinPopup.close(data);
            }

            function pinChanged(popup) {
                if (scopeData.pin.length !== 4) return;

                if (!scopeData.confirm && !state.secured) {

                    scopeData.confirm = true;
                    scopeData.newPin = scopeData.pin;
                    scopeData.pin = '';
                    popup.subTitle = 'Please confirm your PIN';
                    popup.title = 'Confirm New PIN';

                } else if (state.secured && PIN && (scopeData.pin === PIN)) {
                    scopeData.closePopup(securityService.unlock(scopeData.pin));

                    $ionicLoading.show({
                        template: '<i class="icon ion-unlocked"></i><br>Unlocked',
                        duration: 1000
                    })
                } else if (state.secured && PIN && scopeData.pin != PIN) {
                    scopeData.pin = '';
                } else if (scopeData.confirm && !state.secured) {
                    if (scopeData.pin === scopeData.newPin) {
                        securityService.setPin(scopeData.pin);
                        scopeData.closePopup(securityService.unlock(scopeData.pin));

                        $ionicLoading.show({
                            template: '<i class="icon ion-locked"></i><br>Documents Secured',
                            duration: 1000
                        })
                    } else {
                        scopeData.confirm = false;
                        scopeData.pin = '';

                        delete scopeData.newPin;

                        popup.subTitle = 'Secure your Lockbox with a 4 digit PIN';
                        popup.title = 'Confirmation Failed';
                    }
                }
            }
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
            sku: 'cdl',
            name: 'Commercial Driver License',
            info: ''
        },
        {
            sku: 'res',
            name: 'Resume',
            info: ''
        },
        {
            sku: 'ins',
            name: 'Insurance',
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
