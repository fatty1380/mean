(function () {
    'use strict';

//Drivers service used to communicate Drivers REST endpoints
    function DocumentAccessFactory($q, $log, Drivers, Auth) {

        return {
            hasAccess: function(driverId) {
                $log.debug('[DocAccess.hasAccess] Looking up access for driver `%s`', driverId);

                if (Auth.user.driver && (Auth.user.driver === driverId || Auth.user.driver._id === driverId)) {
                    $log.debug('[DocAccess.hasAccess] Granting access to their own documents');
                    return $q.when(true);
                }


                $log.warning('[DocAccess.hasAccess] TODO: Check access against existing connections. Granting access for now');
                return $q.when(true);

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
