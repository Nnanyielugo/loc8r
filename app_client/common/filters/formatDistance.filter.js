(function() {
angular
    .module('loc8rApp')
    .filter('formatDistance', formatDistance);

var _isNumeric = function(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
};
//to be used as Angular filter. formatDistance function must return a 
 //function that accepts distance parameters rather than accepting it itself
function formatDistance(){   
    return function(distance){
     var numDistance, unit;
     if (distance && _isNumeric(distance)){
    //if supplied distance is over 1 km, round to to one decimal place and add km unit
        if (distance > 1) {
        numDistance = parseFloat(distance / 1000).toFixed(1);
        unit = ' km';
        } else {
        //otherwise convert to meters and round to nearest meter before adding m unit
        numDistance = parseInt(distance,10);
        unit = ' m';
        }
        return numDistance + unit;
     } else{
        return "?";
     }
  };
};
})();