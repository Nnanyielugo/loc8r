angular.module('loc8rApp', []);

var locationListCtrl = function($scope) {
    $scope.data = {
        locations: [{
            name: 'Burger Queen',
            address: '125 High Street, Reading, RG6 IPS',
            rating: 3,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            distance: '0.296456',
            _1d: '5370a35f2536f678f8dfb6a'
        }, {
            name: 'Costy',
            address: '125 High Street, Reading, RG6 IPS',
            rating: 4,
            facilities: ['Hot drinks', 'Food', 'Alcoholic drinks'],
            distance: '0.785456',
            _1d: '5370a35f2536f678f8dfb6a'
        }]};
};
//_isNumeric helper function is copied directly from Express code
var _isNumeric = function(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
};

//to be used as Angular filter. formatDistance function must return a 
 //function that accepts distance parameters rather than accepting it itself
var formatDistance = function(){   
    return function(distance){
     var numDistance, unit;
     if (distance && _isNumeric(distance)){
    //if supplied distance is over 1 km, round to to one decimal place and add km unit
        if (distance > 1) {
        numDistance = parseFloat(distance).toFixed(1);
        unit = ' km';
        } else {
        //otherwise convert to meters and round to nearest meter before adding m unit
        numDistance = parseInt(distance * 1000,10);
        unit = ' m';
        }
        return numDistance + unit;
     } else{
        return "?";
     }
  };
};

//create a new function ratingStars and return a basic template, binding to rating of location
var ratingStars = function(){
    return {
        scope: {
            //create new variable  thisRating and tell Angular to value from attribute called rating
            thisRating : '=rating'
        },
        //update template to use new variable
        //template: "{{ thisRating }}"
        //change template tp templateUrl and set path to HTML file you want to use
        templateUrl: '/angular/rating-stars.html'
    };
};

angular
    .module('loc8rApp')
    .controller('locationListCtrl', locationListCtrl)
    .filter('formatDistance', formatDistance)
    .directive('ratingStars', ratingStars);