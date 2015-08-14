(function () {
    'use strict';

    angular
        .module('messages')
        .service('messageService', messageService);

    messageService.$inject = [];

    function messageService () {
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
    }

})();
