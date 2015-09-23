(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('updateService', updateService);

    updateService.$inject = ['$q', '$http', 'settings', 'timerService', '$rootScope'];

    function updateService($q, $http, settings, timerService, $rootScope) {
        var currentMessage, updateAvailable, currentRequest, user,
            currentActivity = {},
            messageObject = {
                newItems: [],
                byIds: {},
                amount: 0
            },
            updates = {
                messages: messageObject,
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
            var messagesArray = removeOwnItems(messages),
                latestMessage = getMostRecentItem(messagesArray);

            if(!currentMessage){
                currentMessage = latestMessage;
            } else if (currentMessage && currentMessage < latestMessage){
                updates.messages = getNewElements(messagesArray, currentMessage);
                console.warn(' updates.messages --->>>', updates.messages);
                currentMessage = latestMessage;
                updateAvailable = true;
            }
        }

        function getActivitiesUpdates (activities) {
            var amount = activities.items && activities.items.length || 0,
                ownActivities = activities.activity && activities.activity.length || 0,
                modifiedDate = new Date(activities.modified).getTime();

            if(!currentActivity.date) {
                currentActivity.date = modifiedDate;
                currentActivity.amount = amount;
                currentActivity.ownActivities = ownActivities;
                console.warn(' first currentActivity --->>>', currentActivity);
            }else{
                if(modifiedDate > currentActivity.date && amount > currentActivity.amount){
                    if(currentActivity.ownActivities !== activities.activity.length) return;

                    updates.activities = amount - currentActivity.amount;

                    currentActivity.date = modifiedDate;
                    currentActivity.amount = amount;
                    currentActivity.ownActivities = ownActivities;

                    updateAvailable = true;
                }
            }
        }

        function getFriendRequestUpdates (requests) {
            if(!updates.requests && requests.length || (updates.requests != requests.length)) {
                updateAvailable = true;
            }
            updates.requests = requests.length;

            //var latestRequest = getMostRecentItem(requests);
            //
            //if(!currentRequest){
            //    currentRequest = latestRequest;
            //} else if (currentRequest && currentRequest < latestRequest){
            //    updates.requests = getNewElementsAmount(requests, currentRequest);
            //    currentRequest = latestRequest;
            //    updateAvailable = true;
            //}
        }

        function removeOwnItems (items) {
            var filteredItems = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i],
                    senderId = item.sender && item.sender._id;

                if(senderId && senderId !== user.id){
                    filteredItems.push(item);
                }
            }
            return filteredItems;
        }

        function getNewElements (elements, offset) {
            var sortedElements, modifiedElements,
                newItems = [];

            modifiedElements = elements.map(function (el) {
                var tempObj = {};

                tempObj.time = new Date(el.created).getTime();
                tempObj.id = el.sender._id;

                return tempObj;
            });

            sortedElements = modifiedElements.sort(function (a,b) {
                return b.time - a.time;
            });

            for(var key in sortedElements){
                if(sortedElements.hasOwnProperty(key)){
                    var id = sortedElements[key].id;

                    if(sortedElements[key].time === offset) break;

                    if(!messageObject.byIds[id]){
                        messageObject.byIds[id] = 1;
                    }else{
                        messageObject.byIds[id] = messageObject.byIds[id] + 1;
                    }

                    newItems.push(sortedElements[key]);
                }
            }

            if(messageObject.newItems.length){
                messageObject.newItems = messageObject.newItems.concat(newItems);
            }else{
                messageObject.newItems = newItems;
            }

            messageObject.amount = messageObject.newItems.length;

            return messageObject;
        }

        //function getNewElementsAmount (elements, offset) {
        //    var sortedDates, amount, dates;
        //
        //    dates = elements.map(function (el) {
        //        return new Date(el.created).getTime();
        //    });
        //    sortedDates = dates.sort(function (a,b) {
        //        return b-a;
        //    });
        //    amount = sortedDates.indexOf(offset);
        //
        //    return amount > 0 ? amount : 0;
        //}

        function getMostRecentItem (items) {
            if(!angular.isArray(items)) return;

            var datesArray = items.map(function (item) {
                return new Date(item.created).getTime();
            });

            return Math.max.apply(this, datesArray);
        }

        function resetUpdates (data, value) {
            if(!data) {
                updates = {
                    messages: 0,
                    activities: 0,
                    requests: 0
                };
            } else if(updates[data]){
                if(data === 'messages'){
                    updates[data] = resetMessages(value);
                }else{
                    updates[data] = value || 0;
                }
            }
            $rootScope.$broadcast('updates-available', updates);
        }

        function resetMessages (id) {
            var messages = updates.messages,
                tempArray = [];

            delete messages.byIds[id];

            for (var i = 0; i < messages.newItems.length; i++) {
                var item = messages.newItems[i];

                if(item.id != id){
                    tempArray.push(item);
                }
            }

            return {
                newItems: tempArray,
                byIds: messages.byIds,
                amount: tempArray.length
            }

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

        function checkForUpdates(sec, profileData) {
            user = profileData;
            return timerService
                .start(sec);
        }

        return {
            getLastUpdates: getLastUpdates,
            checkForUpdates: checkForUpdates,
            resetUpdates: resetUpdates
        };
    }
})();
