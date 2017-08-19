(function(){            //openIIFE
//angular module setter and add ngRoute as a module dependency
angular.module('loc8rApp', ['ngRoute', 'ngSanitize']);

//module config function to hold route definitions
//accept $locationProvider as a parameter in config
function config ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home/home.view.html',      //add templateUrl to route config to specify view template to use
            controller: 'homeCtrl',                  //add controller option to config for route, giving name of comtroller as string
            controllerAs: 'vm'                      //add controllerAs option to route definition, passing variable name to be used as a string
        })
        .when('/about', {
            templateUrl: '/common/views/genericText.view.html',
            controller: 'aboutCtrl',
            controllerAs: 'vm'
        })
        .when('/location/:locationid', {
            templateUrl: '/locationDetail/locationDetail.view.html',
            controller: 'locationDetailCtrl',
            controllerAs: 'vm'
        })
        .otherwise({redirectTo: '/'});
        //set html5Mode to be true
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
}

angular
    .module('loc8rApp')
    //add $locationProvider as a dependency for config
    .config(['$routeProvider', '$locationProvider', config]);       //add config to module, passing through $route provider as a dependency
})();