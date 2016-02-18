(function () {
    'use strict';

    angular
        .module('profile')
        .factory('reviewService', reviewService);

    reviewService.$inject = ['$http', 'settings'];

    function reviewService ($http, settings) {
        var getUserReviews = function () {
                return $http.get(settings.reviews);
            },
            getReviewsByUserID = function (id) {
                if (!id) return;

                var url = settings.profiles + id + '/reviews';
                return $http.get(url);
            },
            postReviewByUserID = function (id, review) {
                if (!id) return;

                var url = settings.profiles + id + '/reviews';
                return $http.post(url, review);
            },
            getReviewByID = function (id) {
                if (!id) return;

                return $http.get(settings.reviews + id);
            },
            updateReviewByID = function (id, updatedReview) {
                if (!id) return;

                return $http.put(settings.reviews + id, updatedReview);
            },
            deleteReviewByID = function (id) {
                if (!id) return;

                return $http.delete(settings.reviews + id);
            };

        //
        function createRequest (data) {
            return $http.post(settings.requests, data);
        }

        return {
            getUserReviews: getUserReviews,
            getReviewsByUserID: getReviewsByUserID,
            postReviewForProfile: postReviewByUserID,
            getReviewByID: getReviewByID,
            updateReviewByID: updateReviewByID,
            deleteReviewByID: deleteReviewByID,
            createRequest: createRequest
        };
    }

})();
