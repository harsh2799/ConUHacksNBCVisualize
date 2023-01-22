var ngApp = angular.module('myNgApp', []);

ngApp.config(['$interpolateProvider', function ($interpolateProvider) {
	$interpolateProvider.startSymbol('{a');
	$interpolateProvider.endSymbol('a}');
}]);

ngApp.controller('myController', function ($scope) {
    $scope.message = "Hello World new!";       
    
    $scope.showMsg = function (msg) {
        alert(msg);
    }; 
});