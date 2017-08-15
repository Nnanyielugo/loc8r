(function () {      //open IIFE
angular
    .module('loc8rApp')
    .directive('ratingStars', ratingStars);

function ratingStars() {
    return {
        //add the restrict attribute
        restrict: 'EA',
        scope: {
            thisRating: '=rating'
        },
        templateUrl: '/common/directives/ratingStars/rating-stars.template.html'
    };
}
})();