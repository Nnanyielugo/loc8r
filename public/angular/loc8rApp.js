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

//create service called geolocation 
var geolocation = function() {
    //define function called getPosition that accepts three callback functions for success, error and notsupported
    var getPosition = function(cbSuccess, cbError, cbNoGeo) {
        if (navigator.geolocation) {
            //if geolocation is supported, call native method, passing through success and error callbacks
            navigator.geolocation.getCurrentPosition(cbSuccess, cbError)
        } else {
            //if geolocation isn't, invoke not supported callback
            cbNoGeo();
        }
    };
    return {
        //return get position function so it can be invoked from controller
        getPosition : getPosition
    }
}

//pass service name into controller function as parameter
//add name of geolocation service to parameters accepted by controller function
var locationListCtrl = function ($scope, loc8rData, geolocation) {
    $scope.message = "checking your location";
    $scope.getData = function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        $scope.message = "Searching for nearby places";
        //invoke loc8rData service, which returns $http.get call
        loc8rData.locationByCoords(lat, lng)
            .success(function(data) {
                $scope.message = data.length > 0 ? "" : "No locations found";
                $scope.data = { locations: data };
            })
            .error(function(e) {
                $scope.message = "Sorry, something's gone wrong ";
            });    
    }
    //function to run if geolocation is supported but not successful
    $scope.showError = function (error) {
        $scope.$apply(function() {
            $scope.message = error.message;
        });
    };
    //function to run if geolocation isn't supported by browser
    $scope.noGeo = function() {
        $scope.$apply(function() {
            $scope.message = "Geolocation not supported by this browser.";
        });
    };
    //pass the function to the grolocation service
    geolocation.getPosition($scope.getData, $scope.showError, $scope.noGeo)
};

//pass $http service into existing service function
var loc8rData = function ($http) {
    var locationByCoords = function (lat, lng) {
        //remove hard-coded data and (later,) values and return $http.get call, ensuring that it is calling correct URL
        return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=200000000000');
    };
    return {
        locationByCoords : locationByCoords
    };
    
};

angular
    .module('loc8rApp')
    .controller('locationListCtrl', locationListCtrl)
    .filter('formatDistance', formatDistance)
    .directive('ratingStars', ratingStars)
    .service('loc8rData', loc8rData)
    .service('geolocation', geolocation);
    