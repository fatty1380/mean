(function () {
    'use strict';

    angular
        .module('profile')
        .factory('friendsService', friendsService);

    friendsService.$inject = ['$http', 'settings'];

    function friendsService($http, settings) {

        //TODO: rework methods to use o

        function getAllFriendsForLoggedUser() {
            return $http.get(settings.friends);
        }

        function getFriendsForSpecificUser(id) {
            if(!id) return;

            return $http.get(settings.users + id + '/friends');
        }

        function getFriendStatus(id) {
            if(!id) return;

            return $http.get(settings.friends + id);
        }

        function getRequestsList() {
            return $http.get(settings.requests);
        }

        function createRequest(id) {
            return $http.post(settings.requests);
        }

        function loadRequest(id) {
            if(!id) return;
            return $http.get(settings.requests + id);
        }

        function updateRequest(id) {
            if(!id) return;
            return $http.put(settings.requests + id);
        }

        var friends = [
            {
                "displayName"   : "Brock Sampson",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "Dr. Thaddeous Venture",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "Hank Venture",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "Dean Venture",
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

        var users = [
            {
                "displayName"   : "User1",
                "userName"   : "user",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "QWER",
                "userName"   : "eqweqw",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "TYU",
                "userName"   : "tttttt",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "IOP",
                "userName"   : "iii",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "sfsf",
                "userName"   : "sssssss",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "gdgdgdfg",
                "userName"   : "ggggg",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "ASD",
                "userName"   : "aaaa",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "FGH",
                "userName"   : "ffffff",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "JKL",
                "userName"   : "jjjjjj",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "ZXC",
                "userName"   : "zzzzzzz",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "vbn",
                "userName"   : "vvvvvvv",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "nm",
                "userName"   : "nnnnnn",
                "emails"        : "",
                "phones"        : ""
            },
            {
                "displayName"   : "eeqweqw",
                "userName"   : "eeeee",
                "emails"        : "",
                "phones"        : ""
            }
        ];

        var allList = friends.concat(contacts);

        return {
            contacts : contacts,
            friends : friends,
            users : users,
            allList : allList,
            getFriendsForSpecificUser: getFriendsForSpecificUser,
            getAllFriendsForLoggedUser: getAllFriendsForLoggedUser,
            getFriendStatus: getFriendStatus,
            getRequestsList: getRequestsList,
            createRequest: createRequest,
            loadRequest: loadRequest,
            updateRequest: updateRequest
        };

    }

})();
