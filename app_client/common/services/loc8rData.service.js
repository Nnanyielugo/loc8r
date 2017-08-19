(function() {
angular
    .module('loc8rApp')
    .service('loc8rData', loc8rData);

//inject variables as an array of strings
loc8rData.$inject = ['$http'];
function loc8rData ($http) {
    var locationByCoords = function (lat, lng) {        
        return $http.get('/api/locations?lng=' + lng + '&lat=' + lat + '&maxDistance=200000000000');
    };

    //create a new locationById method, accepting locationid parameter that uses locationid in a call to API
    var locationById = function(locationid) {
        return $http.get('/api/locations/' + locationid);
    };
    return {
        //expose methods so we can call them from controller
        locationByCoords : locationByCoords,
        locationById : locationById
    };
    
}
})();