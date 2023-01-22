let ngApp = angular.module('myNgApp', []);

ngApp.config(['$interpolateProvider', function ($interpolateProvider) {
	$interpolateProvider.startSymbol('{a');
	$interpolateProvider.endSymbol('a}');
}]);

ngApp.controller('myController', function ($scope, $http) {
    $scope.all_exchanges = {};
    $scope.message = "Hello World";

    window.onload = function(){
        $http({
            method: 'POST',
            url: '/'
          }).then(function successCallback(response) {
              console.log(response);
            }, function errorCallback(response) {
              console.log(response);
            });
    
    };
    





});