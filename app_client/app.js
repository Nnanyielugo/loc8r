//angular module setter and add ngRoute as a module dependency
angular.module('loc8rApp', ['ngRoute']);

//module config function to hold route definitions
function config ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'home/home.view.html',      //add templateUrl to route config to specify view template to use
            controller: 'homeCtrl',                  //add controller option to config for route, giving name of comtroller as string
            controllerAs: 'vm'                      //ass controllerAs option to route definition, passing variable name to be used as a string
        })
        .otherwise({redirectTo: '/'});
}

angular
    .module('loc8rApp')
    .config(['$routeProvider', config]);       //add config to module, passing through $route provider as a dependency
    