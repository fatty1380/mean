(function () {
    'use strict';

    var friendsService = function ($http, settings) {

        var friends = [
            {
                "displayName"   : "some friend1",
                "emails"        : "",
                "phones"        : "",
                "isDivider" : false
            },
            {
                "displayName"   : "some friend1",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "some friend1",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "some friend1",
                "emails"        : "",
                "phones"        : ""
            }
        ];

        var contacts = [
            {
                "displayName"   : "Person",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "jsjsjsj",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "Person",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "jsjsjsj",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "Person",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "jsjsjsj",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "Person",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "jsjsjsj",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "Person",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "jsjsjsj",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "Person",
                "emails"        : "",
                "phones"        : ""
            }
        ];

        friends.unshift( {
            "text"   : "Your Friends",
            "isDivider" : true
        });

        contacts.unshift( {
            "text" : "OutsetUsers",
            "isDivider" : true
        });

        var allList = friends.concat(contacts);

        return {
            contacts : contacts,
            friends : friends,
            allList : allList
        };

    };

    friendsService.$inject = ['$http', 'settings'];

    angular
        .module('profile')
        .factory('friendsService', friendsService);
})();
