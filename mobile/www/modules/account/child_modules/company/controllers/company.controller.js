(function() {
    'use strict';

    function CompanyCtrl() {
        var vm = this;

        vm.companyData = {
            name: 'Company Name',
            news: [
                {
                    title: 'Company News Title',
                    text: "Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo."
                },
                {
                    title: 'Company News Title',
                    text: "Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo."
                },
                {
                    title: 'Company News Title',
                    text: "Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo."
                },
                {
                    title: 'Company News Title',
                    text: "Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo."
                },
                {
                    title: 'Company News Title',
                    text: "Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo."
                },
                {
                    title: 'Company News Title',
                    text: "Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam quirs risus egen urna mollis ornare vel eu leo."
                }
            ]
        }

    }

    CompanyCtrl.$inject = [];

    angular
        .module('company')
        .controller('CompanyCtrl', CompanyCtrl);

})();
