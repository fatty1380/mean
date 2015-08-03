(function () {
    'use strict';

    var reviewService = function ($http, settings) {
        var getUserReviews = function () {
                return $http.get(settings.reviews)
            },
            getReviewsByUserID = function (id) {
                if (!id) return;

                var url = settings.profile + id + '/reviews';
                return $http.get(url);
            },
            postReviewByUserID = function (id, review) {
                if (!id) return;

                var url = settings.profile + id + '/reviews';
                return $http.post(url, review);
            },
            getReviewByID = function (id) {
                if (!id) return;

                return $http.get(settings.reviews + id)
            },
            updateReviewByID = function (id, updatedReview) {
                if (!id) return;

                return $http.put(settings.reviews + id, updatedReview)
            },
            deleteReviewByID = function (id) {
                if (!id) return;

                return $http.delete(settings.reviews + id)
            };

        return {
            getUsersReviews: getUserReviews,
            getReviewsByUserID: getReviewsByUserID,
            postReviewForProfile: postReviewByUserID,
            getReviewByID: getReviewByID,
            updateReviewByID: updateReviewByID,
            deleteReviewByID: deleteReviewByID
        }
    };

    reviewService.$inject = ['$http', 'settings'];

    angular
        .module('profile')
        .factory('reviewService', reviewService);
})();
