(function() {
    'use strict';

    function BgCheckUserController($scope, Authentication, $http, $log, $sce, url, pdfDelegate) {
        var vm = this;
        vm.url = url;

        vm.user = Authentication.user;

        $http.get(url, {responseType:'arraybuffer'})
            .success(function (response) {

                pdfDelegate
                    .$getByHandle('pdf1')
                    .load(response);
            });

        //$scope.pdfUrl = 'modules/bgchecks/img/defaultReport.pdf';

    }

    angular.module('bgchecks').controller('BgCheckUserController', BgCheckUserController);


})();
