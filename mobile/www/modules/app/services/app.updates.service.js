(function () {
    'use strict';

    angular
        .module(AppConfig.appModuleName)
        .service('updateService', updateService);

    updateService.$inject = ['$q', '$http', 'settings', 'timerService', '$rootScope', 'reviewService'];

    function updateService($q, $http, settings, timerService, $rootScope, reviewService) {

        var currentMessage,
            updateAvailable,
            user,
            initialized = false,
            timerName = 'updates-timer',
            currentActivity = {},
            currentReviews = {},
            messageObject = {
                newItems: [],
                byIds: {},
                amount: 0
            },
            updates = {
                messages: messageObject,
                activities: 0,
                requests: 0,
                reviews: 0
            };

        $rootScope.$on(timerName + '-stopped', runUpdateProcess);

        return {
            getLastUpdates: getLastUpdates,
            checkForUpdates: initializeUpdateTimerProcess,
            resetUpdates: resetUpdates
        };
        
        /////////////////////////////////////////////


        function getLastUpdates() {
            logger.debug('getLastUpdates ', updates);
            return updates;
        }

        function initializeUpdateTimerProcess(profileData) {
            user = profileData;

            if (timerService.initTimer(timerName, 15) && !initialized) { // 'updates-timer'
                // if the timer is not already running
                // kick of an early update process;
                runUpdateProcess();
                initialized = true;
            }
        }

        function resetUpdates(data, value) {
            if (!data) {
                updates = {
                    messages: {},
                    activities: 0,
                    requests: 0,
                    reviews: 0
                };
            } else if (updates[data]) {
                if (data === 'messages') {
                    updates[data] = resetMessages(value);
                } else {
                    updates[data] = value || 0;
                }
            }
            $rootScope.$broadcast('updates-available', updates);
        }
        
        /////////////////////////////////////////////////
        
        function runUpdateProcess(event) {
            logger.debug('AppUpdates: Checking for Updates: ', updates);
            var promises = [
                getLatestMessages(),
                getLatestActivity(),
                getLatestFriendRequests(),
                getLatestReviews()
            ]

            return $q.all(promises)
                .then(function (response) {
                    logger.debug('AppUpdates: Checked for Updates: Processing', updates);
                    getUpdates(response);
                    
                    if (!!event) {
                        timerService.restartTimer(timerName);
                    }
                });
        }

        function getUpdates(response) {
            var messages, activities, requests, reviews;

            if (!response) return;

            for (var i = 0; i < response.length; i++) {
                var responseObject = response[i],
                    url = responseObject && responseObject.config && responseObject.config.url;

                if (!url) return;

                if (url.indexOf('messages/') >= 0) {
                    messages = responseObject.data;
                } else if (url.indexOf('requests/') >= 0) {
                    requests = responseObject.data;
                } else if (url.indexOf('feed/') >= 0) {
                    activities = responseObject.data;
                } else if (url.indexOf('reviews/') >= 0) {
                    reviews = responseObject.data;
                }
            }

            updateAvailable = false;

            getMessagesUpdates(messages);
            getActivitiesUpdates(activities);
            getFriendRequestUpdates(requests);
            getReviewUpdates(reviews);

            if (updateAvailable) {
                $rootScope.$broadcast('updates-available', updates);
            }
        }

        function getMessagesUpdates(messages) {
            var messagesArray = filterOutUsersMessages(messages),
                latestMessage = getMostRecentItem(messagesArray);

            if (!currentMessage) {
                currentMessage = latestMessage;
            } else if (currentMessage && currentMessage < latestMessage) {
                updates.messages = processNewMessages(messagesArray, currentMessage);
                logger.info(' updates.messages --->>>', updates.messages);
                currentMessage = latestMessage;
                updateAvailable = true;
            }
        }

        function getActivitiesUpdates(activities) {
            var uniqueItems = _.uniq(activities.items),
                uniqueActivities = _.uniq(activities.activity),
                itemCount = uniqueItems && uniqueItems.length || 0,
                ownActivityCount = uniqueActivities && uniqueActivities.length || 0,
                modifiedDate = new Date(activities.modified).getTime();

            if (!currentActivity.date) {
                currentActivity.date = modifiedDate;
                currentActivity.amount = itemCount;
                currentActivity.ownActivities = ownActivityCount;

                if (itemCount === 1 && ownActivityCount === 0) {
                    // This represents the 'welcome' state, where we need to
                    // show a badge on the activities tab;
                    
                    updates.activities = 1;
                    updateAvailable = true;
                }
            } else if (modifiedDate > currentActivity.date && itemCount > currentActivity.amount) {
                if (currentActivity.ownActivities !== activities.activity.length) {
                    return
                };

                updates.activities = itemCount - currentActivity.amount;

                currentActivity.date = modifiedDate;
                currentActivity.amount = itemCount;
                currentActivity.ownActivities = ownActivityCount;

                updateAvailable = true;

            }
        }
        
        /**
         * getReviewUpdates
         * STUB: This will check for newly posted reviews;
         */
        function getReviewUpdates(reviews) {
            if (_.isEmpty(user)) {
                return;
            }

            var reviewCount = reviews.length;
            var latestReview = !!reviewCount ? _(reviews).sortBy('created').last() : null;
            var latestDate = !!latestReview ? new Date(latestReview.created).getTime() : null;

            if (!currentReviews.date) {
                currentReviews.date = new Date().getTime();
                currentReviews.count = reviewCount;
            }
            else {
                if (_.isEmpty(reviews)) {
                    currentReviews.count = 0;
                    currentReviews.date = new Date().getTime();
                }
                else if (reviewCount > currentReviews.amount) {
                    if (latestDate > currentReviews.date) {
                        updates.reviews = reviewCount - currentReviews.amount;

                        currentReviews.date = latestDate;
                        currentReviews.count = reviewCount;

                        updateAvailable = true;
                    }
                }
            }
        }

        function getFriendRequestUpdates(requests) {
            if (!updates.requests && requests.length || (updates.requests != requests.length)) {
                updateAvailable = true;
            }
            updates.requests = requests.length;
        }

        function filterOutUsersMessages(items) {
            var filteredItems = [];
            for (var i = 0; i < items.length; i++) {
                var item = items[i],
                    senderId = item.sender && item.sender._id;

                if (senderId && senderId !== user.id) {
                    filteredItems.push(item);
                }
            }
            return filteredItems;
        }

        function processNewMessages(elements, offset) {
            var sortedElements, modifiedElements,
                newItems = [];

            modifiedElements = elements.map(function (el) {
                var tempObj = {};

                tempObj.time = new Date(el.created).getTime();
                tempObj.id = el.sender._id;

                return tempObj;
            });

            sortedElements = modifiedElements.sort(function (a, b) {
                return b.time - a.time;
            });

            for (var key in sortedElements) {
                if (sortedElements.hasOwnProperty(key)) {
                    var id = sortedElements[key].id;

                    if (sortedElements[key].time === offset) break;

                    if (!messageObject.byIds[id]) {
                        messageObject.byIds[id] = 1;
                    } else {
                        messageObject.byIds[id] = messageObject.byIds[id] + 1;
                    }

                    newItems.push(sortedElements[key]);
                }
            }

            if (messageObject.newItems.length) {
                messageObject.newItems = messageObject.newItems.concat(newItems);
            } else {
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

        function getMostRecentItem(items) {
            if (!angular.isArray(items)) return;

            var datesArray = items.map(function (item) {
                return new Date(item.created).getTime();
            });

            return Math.max.apply(this, datesArray);
        }

        function resetMessages(id) {
            var messages = updates.messages,
                tempArray = [];

            delete messages.byIds[id];

            for (var i = 0; i < messages.newItems.length; i++) {
                var item = messages.newItems[i];

                if (item.id != id) {
                    tempArray.push(item);
                }
            }

            return {
                newItems: tempArray,
                byIds: messages.byIds,
                amount: tempArray.length
            }

        }
        
        /////////////////////////////////////////

        function getLatestReviews() {
            return reviewService.getUserReviews();
        }

        function getLatestMessages() {
            return $http.get(settings.messages);
        }

        function getLatestActivity() {
            return $http.get(settings.feed);
        }

        function getLatestFriendRequests() {
            return $http.get(settings.requests);
        }
    }
})();
