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
              $scope.show_topstocks_chart();
            }, function errorCallback(response) {
              console.log(response);
            });
    
    };
    

    $scope.set_current_exchange = function(index) {
      $scope.view_anomaly = false;
      $scope.show_topstocks_chart();
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
          if (cs[key]["NewOrderRequest"] && cs[key]["NewOrderRequest"]["OrderPrice"]){
            price_list.push(cs[key]["NewOrderRequest"]["OrderPrice"])
            time_list.push(new Date(cs[key]["NewOrderRequest"]["TimeStamp"]))
        }
          else{
            price_list.push(price_list[price_list.length - 1])
            time_list.push(new Date(time_list[time_list.length - 1]));
          }
            
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
            categories: time_list,
            title: {
                enabled: true,
                text: 'Hours of the Day'
            },
            type: 'datetime',
            dateTimeLabelFormats : {
                hour: '%I %p',
                minute: '%I:%M %p'
            }
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
           name: 'Time vs Order Price',
           data: price_list
          }]
        });
      };


      $scope.show_topstocks_chart = function() {

        let trending_data = [];

        let data = $scope.all_data[$scope.current_exchange];

        let keys = Object.keys(data);

        // Then sort by using the keys to lookup the values in the original object:
        keys.sort(function(a, b) { return keys[a] - keys[b] });
        let count = 0;
        for(stock in keys) {
          if (++count == 10) {
            break;
          }
        trending_data.push({
          name:  keys[stock],
          y: $scope.total_data[$scope.current_exchange][keys[stock]]
        })

        }

        Highcharts.chart('all-stock-details', {
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
          },
          title: {
            text: 'Trending Stocks',
            align: 'left'
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
          },
          
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.y}'
              }
            }
          },
          series: [{
            name: 'Stocks',
            colorByPoint: true,
            data: trending_data
          }]
        });
      };









});