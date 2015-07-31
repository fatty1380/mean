(function () {
    'use strict';

    var messageService = function () {
        var vm  = this;

        vm.messages = [
            {
                user: 'Username',
                content: 'Etiam porta sem malesuade',
                created: 'on Monday'
            },
            {
                user: 'Username',
                content: 'Etiam porta sem malesuade',
                created: 'on Monday'
            },
            {
                user: 'Username',
                content: 'Etiam porta sem malesuade',
                created: 'on Monday'
            },
            {
                user: 'Username',
                content: 'Etiam porta sem malesuade',
                created: 'on Monday'
            },
            {
                user: 'Username',
                content: 'Etiam porta sem malesuade',
                created: 'on Monday'
            },
            {
                user: 'Username',
                content: 'Etiam porta sem malesuade',
                created: 'on Monday'
            }
        ]
    };

    messageService.$inject = [];

    angular
        .module('messages')
        .service('messageService', messageService);

})();
