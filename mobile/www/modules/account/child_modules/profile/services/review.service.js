(function () {
    'use strict';

    angular
        .module('profile')
        .factory('reviewService', reviewService);

    reviewService.$inject = ['$http', 'settings'];

    function reviewService ($http, settings) {
        function getUserReviews () {
            return $http.get(settings.reviews);
        }
        function getReviewsByUserID (id) {
            if (!id) { return; }

            var url = settings.profiles + id + '/reviews';
            return $http.get(url);
        }
        function postReviewByUserID (id, review) {
            if (!id) { return; }

            var url = settings.profiles + id + '/reviews';
            return $http.post(url, review);
        }
        function getReviewByID (id) {
            if (!id) { return; }

            return $http.get(settings.reviews + id);
        }
        function updateReviewByID (id, updatedReview) {
            if (!id) { return; }

            return $http.put(settings.reviews + id, updatedReview);
        }
        function deleteReviewByID (id) {
            if (!id) { return; }

            return $http.delete(settings.reviews + id);
        }
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
