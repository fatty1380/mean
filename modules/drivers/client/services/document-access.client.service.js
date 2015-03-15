(function () {
    'use strict';

//Drivers service used to communicate Drivers REST endpoints
    function DocumentAccessFactory($q, $log, Drivers, Auth) {

        return {
            hasAccess: function(driverId, application) {
                $log.debug('[DocAccess.hasAccess] Looking up access for driver `%s`', driverId);

                if (Auth.user.driver && (Auth.user.driver === driverId || Auth.user.driver._id === driverId)) {
                    $log.debug('[DocAccess.hasAccess] Granting access to their own documents');
                    return $q.when(Auth.user.driver);
                }
                else {
                    var deferred = $q.defer();
                    var isConnected = !!application.isConnected && !!application.connection && application.connection.isValid;

                    if (!isConnected) {
                        deferred.reject('Sorry, but you are not connected to this applicant');
                    }

                    Drivers.get(driverId).then(
                        function(driverProfile) {
                            $log.debug('got driver');

                            if(!!driverProfile && !_.isEmpty(driverProfile)) {
                               return deferred.resolve(driverProfile);
                            }

                            deferred.reject('No Driver Profile found for driver id: ' + driverId);
                        }
                    );

                    return deferred.promise;
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
