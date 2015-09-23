(function () {
    'use strict';

//Drivers service used to communicate Drivers REST endpoints
    function DocumentAccessFactory($q, $log, Drivers, Auth) {

        return {
            hasAccess: function(driverId, application) {
                $log.debug('[DocAccess.hasAccess] Looking up access for driver `%s`', driverId);

                if (Auth.user && (Auth.user === driverId || Auth.user.id === driverId)) {
                    return true;
                }
                else {
                    if (!application || !application.canViewDocs) {
                        return false;
                    }

                    return true;
                }
            },
            getDriver: function(driverId, application) {
                $log.debug('[DocAccess.hasAccess] Looking up access for `%s` to driver `%s`', Auth.user.id, driverId);

                if(this.hasAccess(driverId, application)) {
                    if (Auth.user && (Auth.user === driverId || Auth.user.id === driverId)) {
                        $log.debug('[DocAccess.hasAccess] Granting access to their own documents');
                        return $q.when(Auth.user);
                    }
                    else {
                        if (!application || !application.canViewDocs) {
                            return $q.reject('Sorry, but you do not have access to this applicant\'s documents');
                        }

                        var deferred = $q.defer();
                        Drivers.get(driverId).then(
                            function(driverProfile) {
                                $log.debug('got driver');

                                if(!!driverProfile && !_.isEmpty(driverProfile)) {
                                    return deferred.resolve(driverProfile);
                                }

                                return deferred.reject('No Driver Profile found for driver id: ' + driverId);
                            }
                        );

                        return deferred.promise;
                    }
                }
                else {
                    return $q.reject('Sorry, but you do not have access to this driver\'s documents');
                }
            },
            updateFileUrl: function (driverId, file) {

                $log.debug('[DocAccess.getFileUrl] Looking up file `%s` for driver `%s`', file.sku, driverId);

                var deferred = $q.defer();

                if (moment().isBefore(moment(file.expires))) {
                    deferred.resolve(file);
                }
                else {
                    Drivers.getDownloadLink(driverId, file.sku || 'resume').then(
                        function (success) {
                            $log.debug('[DocAccess.getFileUrl] Got new resume link! %o', success);
                            deferred.resolve(success);
                        });
                }

                return deferred.promise;
            }


        };
    }

    DocumentAccessFactory.$inject = ['$q', '$log', 'Drivers', 'Authentication'];

    angular
        .module('drivers')
        .factory('DocAccess', DocumentAccessFactory);
})();
