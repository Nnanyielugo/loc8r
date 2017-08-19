(function(){
    angular
        .module('loc8rApp')
        .controller('locationDetailCtrl', locationDetailCtrl);

    //inject $routeParams service into controller, peotecting against minification
    locationDetailCtrl.$inject = ['$routeParams', 'loc8rData'];
    ///pass $routeParams into controller so we can use it
    function locationDetailCtrl($routeParams, loc8rData) {
        var vm = this;
        //get locationid from $routeParams and save it in view model
        vm.locationid = $routeParams.locationid;

        loc8rData.locationById(vm.locationid)
            .success(function(data) {
                vm.data = { location: data }           //if request is successful, save returned data in view model
                vm.pageHeader = {
                     //uselocationid in page title
                    //title: vm.locationid
                    //instead, output location name to pageheader
                    title: vm.data.location.name
                };
            })
            .error(function(e) {
                console.log(e);
            });                   
        }    
})();