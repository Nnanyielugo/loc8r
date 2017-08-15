(function() {
//use module setter to add new controller to application
angular
    .module('loc8rApp')
    .controller('homeCtrl', homeCtrl);

//define new controller homeCtrl and bind some data for page header and sidebar
//remove $scope from function definition, assign 'this to vm(view model) variable, and update data bindings to use vm instead of $scope
//pass name of services into controller
//manually inject the dependencies as strings
homeCtrl.$inject = ['$scope', 'loc8rData', 'geolocation'];
function homeCtrl($scope, loc8rData, geolocation) {
    var vm = this;
    vm.pageHeader = {
        title: 'Loc8r',
         strapline: 'Find places to work with wifi near you!'
    };
    vm.sidebar = {
        content: 'Looking for wifi and a seat?\n Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? let Loc8r help you find the place you\'re looking for.'
    };
    vm.message = "checking your location";
    vm.getData = function(position) {
        var lat = position.coords.latitude,
            lng = position.coords.longitude;
        vm.message = "Searching for nearby places";
        //invoke loc8rData service, which returns $http.get call
        loc8rData.locationByCoords(lat, lng)
            .success(function(data) {
                vm.message = data.length > 0 ? "" : "No locations found";
                vm.data = { locations: data };
                console.log(vm.data);
            })
            .error(function(e) {
                vm.message = "Sorry, something's gone wrong ";
            });    
    }
    //function to run if geolocation is supported but not successful
    vm.showError = function (error) {
        $scope.$apply(function() {
            vm.message = error.message;
        });
    };
    //function to run if geolocation isn't supported by browser
    vm.noGeo = function() {
        $scope.$apply(function() {
            vm.message = "Geolocation not supported by this browser.";
        });
    };
    //pass the function to the grolocation service
    //replace $scope references with vm
    geolocation.getPosition(vm.getData,vm.showError,vm.noGeo)
};
})();