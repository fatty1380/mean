(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('updateService', updateService);

    updateService.$inject = ['$q', '$http', 'settings', 'timerService', '$rootScope'];

    function updateService($q, $http, settings, timerService, $rootScope) {
        var currentMessage, updateAvailable, currentRequest,
            currentActivity = {},
            updates = {
                messages: 0,
                activities: 0,
                requests: 0
            };

        $rootScope.$on('timer-stopped', function(event, remaining) {
            if(remaining === 0) {
                var promises = [],
                    messagePromise = getMessagesStatus(),
                    activityPromise = getActivityStatus(),
                    friendRequestPromise = getFriendRequestStatus();

                promises.push(messagePromise, activityPromise, friendRequestPromise);

                $q.all(promises)
                    .then(function (response) {
                        getUpdates(response);
                        timerService.restartTimer();
                    });
            }
        });

        function getUpdates (response) {
            var messages, activities, requests;

            for (var i = 0; i < response.length; i++) {
                var responseObject = response[i],
                    url = responseObject.config.url;

                if(url.indexOf('messages') >= 0){
                    messages = responseObject.data;
                } else
                if (url.indexOf('requests') >= 0) {
                    requests = responseObject.data;
                } else
                if (url.indexOf('feed') >= 0) {
                    activities = responseObject.data;
                }
            }

            updateAvailable = false;

            getMessagesUpdates(messages);
            getActivitiesUpdates(activities);
            getFriendRequestUpdates(requests);

            if(updateAvailable) $rootScope.$broadcast('updates-available', updates);
        }

        function getMessagesUpdates (messages) {
            var latestMessage = getMostRecentItem(messages);

            if(!currentMessage){
                currentMessage = latestMessage;
            } else if (currentMessage && currentMessage < latestMessage){
                updates.messages = getNewElementsAmount(messages, currentMessage);
                currentMessage = latestMessage;
                updateAvailable = true;
            }
        }

        function getActivitiesUpdates (activities) {
            var amount = activities.items && activities.items.length || 0,
                modifiedDate = new Date(activities.modified).getTime();

            if(!currentActivity.date) {
                currentActivity.date = modifiedDate;
                currentActivity.amount = amount;
            }else{
                if(modifiedDate > currentActivity.date && amount > currentActivity.amount){
                    updates.activities = amount - currentActivity.amount;
                    currentActivity.date = modifiedDate;
                    currentActivity.amount = amount;
                    updateAvailable = true;
                }
            }
        }

        function getFriendRequestUpdates (requests) {
            var latestRequest = getMostRecentItem(requests);

            if(!currentRequest){
                currentRequest = latestRequest;
            } else if (currentRequest && currentRequest < latestRequest){
                updates.requests = getNewElementsAmount(requests, currentRequest);
                currentRequest = latestRequest;
                updateAvailable = true;
            }
        }

        function getNewElementsAmount (elements, offset) {
            var sortedDates, amount, dates;

            dates = elements.map(function (el) {
                return new Date(el.created).getTime();
            });
            sortedDates = dates.sort(function (a,b) {
                return b-a;
            });
            amount = sortedDates.indexOf(offset);

            return amount > 0 ? amount : 0;
        }

        function getMostRecentItem (items) {
            if(!angular.isArray(items)) return;

            var itemsArray = items.map(function (item) {
                return new Date(item.created).getTime();
            });

            return Math.max.apply(this, itemsArray);
        }


        function getMessagesStatus () {
            return $http.get(settings.messages);
        }

        function getActivityStatus () {
            return $http.get(settings.feed);
        }
        function getFriendRequestStatus () {
            return $http.get(settings.requests);
        }

        function getLastUpdates() {
            return updates;
        }

        function checkForUpdates(sec) {
            return timerService
                .start(sec);
        }

        function resetUpdates (data) {
            if(!data) {
                updates = {
                    messages: 0,
                    activities: 0,
                    requests: 0
                };
            } else
            if(updates[data]){
                updates[data] = 0;
            }
        }

        return  {
            getLastUpdates: getLastUpdates,
            checkForUpdates: checkForUpdates,
            resetUpdates: resetUpdates
        };
    }
})();
