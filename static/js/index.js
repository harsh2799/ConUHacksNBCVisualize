let ngApp = angular.module('myNgApp', []);

ngApp.config(['$interpolateProvider', function ($interpolateProvider) {
	$interpolateProvider.startSymbol('{a');
	$interpolateProvider.endSymbol('a}');
}]);

ngApp.controller('myController', function ($scope, $http) {
    $scope.all_exchanges = [];
    $scope.message = "Hello World";
    $scope.all_data = {};
    $scope.trade_data = {};
    $scope.cancelled_data = {};
    $scope.total_data = {};
    $scope.current_exchange = "";
    $scope.current_stock = "";
    $scope.stock_name = "";
    $scope.Math = window.Math;
    $scope.anomaly_list = [];
    $scope.view_anomaly = false;

    window.onload = function(){
        $http({
            method: 'POST',
            url: '/'
          }).then(function successCallback(response) {
              
              let data = JSON.parse(response.data);
              $scope.all_exchanges = data['exchanges'];
              $scope.current_exchange = data['exchanges'][0];
              $scope.all_data = data['json_data'];
              console.log(data);
              $scope.trade_data = data['trade_data'];
              $scope.cancelled_data = data['cancelled_data'];
              $scope.total_data = data['total_data'];
            }, function errorCallback(response) {
              console.log(response);
            });
    
    };
    

    $scope.set_current_exchange = function(index) {
      $scope.view_anomaly = false;
      if ($scope.current_exchange !== $scope.all_exchanges[index]) {
        $scope.current_exchange = $scope.all_exchanges[index];
        $scope.current_stock = '';
      }
      
    };

    $scope.set_current_stock = function(stock_name) {
      $scope.view_anomaly = false;
      $scope.current_stock = stock_name;
      $scope.build_line_chart();
    };

    $scope.show_anomaly_table = function() {
        $scope.anomaly_list = [];
        let current_data = $scope.all_data[$scope.current_exchange][$scope.current_stock];
        for(key in current_data) {
           let order_data = current_data[key];
           if (order_data['NewOrderRequest'] && order_data['NewOrderAcknowledged']) {
              if (order_data['Trade'] || order_data['CancelRequest']) {
                if (!(order_data['CancelAcknowledged'] && order_data['Cancelled'])) {
                  $scope.anomaly_list.push(key);
                }   
              }
              else {
                $scope.anomaly_list.push(key);
              }
           }
           else {
              $scope.anomaly_list.push(key);
           }
        }
        $scope.view_anomaly = true;
    
    
      };


    $scope.build_line_chart = function() {

        let cs = $scope.all_data[$scope.current_exchange][$scope.current_stock];

        let price_list = [];
        let time_list = [];
        for(key in cs){
          price_list.push(cs[key]["NewOrderRequest"]["OrderPrice"])
          time_list.push(cs[key]["NewOrderRequest"]["TimeStamp"])
        }
        console.log(cs);

        const chart = Highcharts.chart('chart',{	
          chart : {
           zoomType: 'x'
          },
          title : {
           text: 'Price List for Stock '+ $scope.current_stock.toUpperCase() +' over time'   
          },
          subtitle : {
           text: document.ontouchstart === undefined ?
           'Click and drag in the plot area to zoom in' :
           'Pinch the chart to zoom in'
          },
          xAxis : {
           type: 'datetime',
           minRange: 14 * 24 * 3600000 // fourteen days
          },
          yAxis : {
           title: {
            text: 'Exchange rate'
           }
          },
          legend : {
           enabled: false 
          },
          plotOptions : {
           area: {
            fillColor: {
               linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
               stops: [
                [0, Highcharts.getOptions().colors[0]],
                [1, Highcharts.Color(
                 Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
               ]
            },
            marker: {
               radius: 2
            },
            lineWidth: 1,
            states: {
               hover: {
                lineWidth: 1
               }
            },
            threshold: null
           }
          },
          series: [{
           type: 'area',
           name: 'Time vs Order Pricec',
           pointInterval: 24 * 3600 * 1000,
           pointStart: Date.UTC(2006, 0, 1),
           data: price_list
          }]
        });
      
      //     /**var json = {};
      //     json.chart = chart;
      //     json.title = title;
      //     json.subtitle = subtitle;
      //     json.legend = legend;
      //     json.xAxis = xAxis;
      //     json.yAxis = yAxis;  
      //     json.series = series;
      //     json.plotOptions = plotOptions;
          // $('#lineChart').highcharts(json);*/
      //   });
      };


});