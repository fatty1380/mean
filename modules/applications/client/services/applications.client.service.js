(function () {
    'use strict';
//Applications service used to communicate Applications REST endpoints

    /**
     * service.factory('ProductsRest', ['$resource', function ($resource) {
    return $resource('api/service/products/:dest', {}, {
        query: {method: 'GET', params: {dest:"allProducts"}, isArray: true },
        save: {method: 'POST', params: {dest:"modifyProduct"}},
        update: { method: 'POST', params: {dest:"modifyProduct"}},
    });
}]);
     */

    var ApplicationsService = function ($resource, $log, $q) {

        var _this = this;

        _this._data = {
            ByJob: $resource('api/jobs/:jobId/applications', {
                jobId: '@jobId'
            }, {
                query: {
                    method: 'GET',
                    isArray: true
                },
                save: {
                    method: 'POST'
                }
            }),
            ById: $resource('api/applications/:id', {
                id: '@_id'
            }, {
                update: {
                    method: 'PUT'
                },
                save: {
                    method: 'POST'
                }
            }),
            setStatus: function (id, status) {
                debugger;

                return new _this._data.ById({_id: id, 'status': status}).$update();
            },
            getApplication: function (query) {

                if (!query || !query.hasOwnProperty('applicationId')) {
                    $log.warn('Cannot get application without application ID');
                    return null;
                }

                var RSRC = $resource('api/applications/:applicationId', {
                    applicationId: '@applicationId'
                });

                return RSRC.get(query).$promise;
            },
            listByUser: function (query) {
                var RSRC = $resource('api/users/:userId/applications', {
                    userId: '@userId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                });

                return RSRC.query(query).$promise;
            },
            listByCompany: function (query) {
                var RSRC = $resource('api/companies/:companyId/applications', {
                    companyId: '@companyId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: true
                    }
                });

                return RSRC.query(query).$promise;

            },
            createConnection: function (application) {
                var RSRC = $resource('/api/applications/:applicationId/connect', {
                    applicationId: '@_id'
                }, {
                    get: {
                        method: 'POST',
                        isArray: false
                    }
                });

                return RSRC.get(application).$promise;
            },
            ForDriver: $resource('api/jobs/:jobId/applications/:userId', {
                jobId: '@jobId',
                userId: '@userId'
            }),
            getMessages: function (applicationId, userId) {
                var RSRC = $resource('api/applications/:applicationId/messages', {
                    companyId: '@companyId'
                }, {
                    query: {
                        method: 'GET',
                        isArray: false
                    }
                });

                return RSRC.query({applicationId: applicationId, userId: userId}).$promise;
            },
            checkMessages: function (application, userId) {
                var applicationId = application._id;

                return _this._data.getMessages(applicationId, userId)
                    .catch(function (err) {
                        $log.debug('Caught error %o with status: %s', err, err.status);

                        if (err.status === 403 && !!application.connection) {
                            return $q.when(err.data);
                        }
                        else {
                            return $q.reject(err);
                        }
                    }).then(function (success) {
                        application.messages = success.data || [];
                        application.lastMessage = success.latest || null;
                        application.messageCt = !!success.theirs ? success.theirs.length : 0;
                        application.newMessages = success.newMessages || 0;

                        if (application.newMessages > 0) {
                            application.messagingText = application.newMessages + ' new message' + (application.newMessages === 1 ? '' : 's') + ' awaiting your reply';
                        } else {
                            application.messagingText = application.messages.length + ' total messages';
                        }

                        return $q.when(application);
                        //vm.newMessages += application.newMessages;

                    }).catch(function (err) {
                        application.messages = [];
                        application.lastMessage = {created: 100000000000};
                        application.messageCt = 0;
                        application.newMessages = 0;
                        $log.warn('Error retrieving messages: %o (this needs to be handled)', err);
                        return $q.reject(err);
                    });
            },
            getMaskedDisplayName: function (application) {
                if (!application.connection) {
                    return application.user.firstName + ' ' + application.user.lastName.substring(0, 1);
                }

                return application.user.displayName;
            },
            getQuestions: function () {
                var qs = {
                    'default': [
                        {
                            'description': 'Write a short sentence',
                            'name': 'sentence',
                            'length': '50',
                            'type': 'string',
                            'required': true
                        },
                        {
                            'description': 'Cover Letter',
                            'name': 'coverLetter',
                            'length': '',
                            'type': 'text',
                            'required': true
                        },
                        {
                            'description': 'Check this box',
                            'name': 'checkbox',
                            'length': '',
                            'type': 'checkbox'
                        },
                        {
                            'description': 'Require this box',
                            'name': 'checkbox',
                            'length': '',
                            'type': 'checkbox',
                            'required': true
                        },
                        {
                            'description': 'Choose Radio Value',
                            'name': 'radio',
                            'length': '',
                            'type': 'radio',
                            'options': [{'label': 'Absolutely Yes', 'value': true}, {
                                'label': 'Positively No',
                                'value': false
                            }, {'label': 'I Dunno', 'value': null}]
                        },
                        {
                            'description': 'Can you see this?',
                            'name': 'isVisible',
                            'pickList': [
                                {
                                    'description': 'YES!',
                                    'value': true
                                },
                                {
                                    'description': 'no :(',
                                    'value': false
                                }
                            ],
                            'type': 'string',
                            'required': false
                        }
                    ]
                };

                //return qs.default;
                return null;
            }
        };

        return _this._data;
    };

    ApplicationsService.$inject = ['$resource', '$log', '$q'];

    angular.module('applications').factory('Applications', ApplicationsService);


})
();
