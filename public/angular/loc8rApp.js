angular.module('loc8rApp', []);

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


//pass service name into controller function as parameter
var locationListCtrl = function ($scope, loc8rData) {
    $scope.message = "Searching for nearby places";
    //invoke loc8rData service, which returns $http.get call
    loc8rData
        .success(function(data) {
            $scope.message = data.length > 0 ? "" : "No locations found";
            $scope.data = { locations: data };
        })
        .error(function (e) {
            $scope.message = "Sorry, something's gone wrong ";
        });    
};

//pass $http service into existing service function
var loc8rData = function ($http) {
    //remove hard-coded data and return $http.get call, ensuring that it is calling correct URL
    return $http.get('/api/locations?lng=-0.79&lat=51.3&maxDistance=200000000');
};

/*var locationListCtrl = function ($scope, loc8rData)

var loc8rData = function($http) {
    return $http.get('/api/locations?lng=-0.79&lat=51.3&maxDistance=20000000');
} */

angular
    .module('loc8rApp')
    .controller('locationListCtrl', locationListCtrl)
    .filter('formatDistance', formatDistance)
    .directive('ratingStars', ratingStars)
    .service('loc8rData', loc8rData);
    