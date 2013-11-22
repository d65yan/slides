      var AP=angular.module("aboutPlace", ['ngRoute','ngTouch','ngAnimate','ui.directives','ui.bootstrap','LocalServices','Directives','customFiltersModule'/*,'MapModule'*/]) 
      .config(['$routeProvider','$locationProvider','$interpolateProvider', function($routeProvider,$locationProvider,$interpolateProvider) {
        $routeProvider.when('/', {templateUrl: 'views/goals.html'}).
        when('/measures', {templateUrl: 'views/measurements.html'}).
        when('/tech', {templateUrl: 'views/techniques.html', controller: MapsCtrl}).
        when('/conclusions', {templateUrl: 'views/conclusions.html'}).                
        when('/variables', {templateUrl: 'views/variable.html', controller: ChartsCtrl}).
        when('/maps', {templateUrl: 'views/nhbds.html', controller: MapsCtrl}).
        when('/results', {templateUrl: 'views/results_slide.html'}).
        when('/stmap1', {templateUrl: 'views/stmap_1.html'}).
        when('/stmap2', {templateUrl: 'views/nhbds.html', controller: MapsCtrlSmall}).
        when('/table', {templateUrl: 'views/results.html'}).
	otherwise({redirectTo: '/'});
//$locationProvider.html5Mode(true);

}]);
      
      function AppController($scope,$window,$http,$timeout,$rootScope,$dialog,$routeParams,$location){
          
          $scope.slides=["","measures","tech","results","maps","table","stmap2","stmap1","conclusions","variables"];
          $scope.counter=-1;
          $scope.fonts=14;
          
          $scope.Go_Previous=function(){
              $location.path('/'+$scope.slides[$scope.counter-1]);
          }
          
          $scope.Go_Next=function(){
              $location.path('/'+$scope.slides[$scope.counter+1]);
          };
          
          $scope.GoTo=function(){
               $location.search('c',$scope.selectedArea.id);
               if($scope.selection.activeLifeStyle.id)
                $location.search('l',$scope.selection.activeLifeStyle.id);
          }
          
          $scope.CollapseAll=function(){
              $rootScope.$broadcast('collapse',-1);
          }
          
          
          $scope.$on('$routeChangeStart',function(next,current,previous){

              var path=current.redirectTo || current.originalPath;
              var path=path.split('/')[1];
              var pos=$scope.slides.indexOf(path);
              $rootScope.same=pos===$scope.counter;
              $rootScope.back=pos<$scope.counter;
              $timeout(function(){$scope.counter=pos;});
                    
          });
  
  
    }
      AppController.$inject=['$scope','$window','$http','$timeout','$rootScope','$dialog','$routeParams','$location'];
     
     function ChartsCtrl($scope,$window,$timeout,$location,$filter){
         

             /* 
              * CORRECT THESE VARIABLE NAMES IN JSON FILE
              *     "attn_09_m": null,
                "attn_09_h": null,
                "attn_10_e": 95.04,
                "attn_10_m": null,
                "attn_10_h": null,
                "attn_11_e": 94.92,
                "attn_11_m": null,
                "attn_11_h": null,
                "attn_12_e": 94.27,
                "attn_12_m": null,
                "attn_12_h": null*/
         $scope.activeVar="elementary_attendance";
        // $scope.activeYear="2009";
        $scope.variables={
            attn_e:{
                show:true,
                name:"Attendance Elementary",
                color:'#F2473F',
                title_1:"Attendance Rates for Elementary Schools",
                title_2:"",
                axis:{
                    x:{
                        splits:[92,93.4,94.8,96.2,97.6,99],
                        title:"Attendance Rates (%)"
                    },
                    y:{
                        title:"Number of Schools",
                        domain:[0,120]
                    }
                },
                data:{
                    "2009":[96.7,93.99,94.62,96.62,95.79,94.06,94.54,95.7,96.94,96.7,95.09,97.24,96.4,96.36,96.61,97.76,94.13,96.34,94.51,95.7,97.21,95.79,96.16,94.33,95.93,97.14,96.03,95.62,96.45,94.37,94.04,94.83,96.81,94.05,96.25,95.3,94.85,96.22,95.27,96.31,96.98,96.75,96.0,96.01,97.36,96.45,97.01,96.82,96.24,95.39,94.27,96.63,94.82,94.44,94.8,96.71,96.71,97.19,96.5,96.5,96.3,96.84,96.88,96.17,96.78,94.62,95.9,96.6,97.05,96.36,96.28,95.13,96.53,95.74,96.2,95.52,96.46,96.02,96.7,95.9,95.42,95.88,96.26,96.35,96.91,94.68,94.99,96.8,96.42,96.93,97.03,96.75,95.21,96.36,96.35,96.14,95.41,96.22,97.51,97.04,95.24,96.92,94.34,95.07,93.84,95.67,94.6,96.28,97.41,96.38,96.52,95.88,95.89,95.15,97.26,95.48,96.42,96.49,96.78,96.5,96.12,95.59,94.63,94.98,96.79,96.3,96.22,95.39,95.37,95.17,96.54,97.31,96.93,96.5,97.1,96.46,95.9,96.02,93.64,94.97,96.85,96.23,97.25,95.89,95.98,96.52,96.0,95.65,96.64,96.08,94.81,95.35,94.12,96.47,95.43,95.94,96.19,95.66,95.98,95.8,97.26,96.38,96.6,97.05,94.68,96.58,96.31,95.48,95.54,95.69,96.21,96.35,95.63,96.77,96.98,95.81,97.03,96.45,97.12,95.86,96.22,95.89,95.52,95.36,96.78,96.38,97.51,96.47,96.68,95.98,95.84,93.23,95.45,98.37,97.06,96.57,96.44,94.43,93.22,95.76,93.01,96.47,97.16,94.0,94.8,95.66,95.64],
                    "2010":[96.38,94.01,95.04,96.65,95.45,93.67,94.36,95.4,96.25,96.09,95.19,96.71,95.95,95.47,96.2,97.01,93.73,95.93,94.1,95.04,97.0,95.56,95.82,94.19,95.58,96.74,95.95,95.45,96.16,94.14,94.34,93.57,96.13,94.42,95.67,94.75,94.52,95.6,94.78,95.78,96.67,96.7,95.82,95.94,97.42,96.18,96.51,96.61,95.94,95.39,94.04,96.36,93.99,94.27,94.11,96.23,96.41,97.01,96.16,96.12,95.81,96.28,96.54,95.82,96.17,94.48,95.33,96.89,96.62,95.81,96.05,94.44,96.12,95.62,96.07,95.02,95.7,95.22,96.04,95.53,95.44,95.5,95.93,96.28,96.68,94.8,94.97,96.6,96.1,96.58,96.44,96.31,94.72,96.3,96.3,95.79,94.95,96.38,97.08,96.58,94.95,96.04,94.84,95.2,94.04,95.64,94.68,96.15,97.37,95.91,96.23,95.17,94.95,94.96,96.84,94.71,96.54,96.07,95.83,96.48,95.95,95.73,94.61,95.14,96.23,95.72,96.22,95.01,95.34,94.55,95.82,96.86,95.67,96.43,96.76,96.11,95.46,96.03,93.97,94.25,96.54,95.7,96.91,95.83,95.59,95.88,95.58,95.39,96.62,95.57,94.1,95.03,93.86,96.06,95.32,94.92,95.51,94.94,96.04,95.42,97.05,96.04,95.9,96.97,94.8,96.35,96.31,94.33,94.83,94.82,95.75,95.87,95.02,96.43,96.45,95.5,97.06,96.46,96.51,95.92,95.79,96.23,95.35,95.46,97.02,96.18,97.46,96.25,95.81,96.17,95.16,92.97,94.68,98.21,96.87,96.43,95.76,94.22,94.2,95.29,92.24,96.38,97.08,93.5,94.43,95.05,95.44],
                    "2011":[96.24,93.83,94.92,96.97,95.51,92.92,94.19,94.89,96.07,96.21,94.58,96.33,95.98,95.3,96.09,97.16,93.75,95.82,93.52,94.84,97.05,95.56,95.89,94.24,95.69,96.63,96.27,95.33,96.13,94.53,93.63,94.53,96.34,94.55,95.52,94.5,94.57,95.73,95.05,96.2,96.47,97.06,95.58,95.85,97.26,95.98,96.1,96.62,95.84,95.12,94.34,96.35,93.49,94.46,94.09,96.43,95.6,96.85,96.06,96.1,95.96,95.81,96.5,95.23,96.6,94.19,95.63,96.78,96.65,95.82,95.9,94.48,96.19,95.79,95.83,95.09,95.46,94.69,96.33,95.68,94.96,95.47,96.26,96.11,96.14,94.33,95.39,96.38,96.05,96.56,96.55,96.2,94.92,96.38,96.16,95.64,95.16,95.91,97.27,96.58,95.64,96.16,94.84,94.99,95.02,95.55,94.41,96.29,97.47,96.69,96.06,95.53,94.62,94.5,96.77,93.95,96.38,95.97,95.84,96.85,96.34,94.75,94.7,95.19,96.53,96.38,95.56,95.1,94.77,95.09,95.83,97.67,96.2,96.12,96.56,96.22,95.65,96.26,93.79,93.8,96.71,95.96,96.94,96.25,95.94,96.33,95.77,95.4,96.27,96.35,94.39,95.33,94.09,96.12,95.54,95.1,95.25,95.34,96.1,95.6,96.83,96.38,96.27,97.01,94.86,97.04,96.24,95.27,95.03,94.31,95.65,95.81,94.93,96.59,96.71,95.13,97.09,96.39,96.4,95.5,96.05,96.38,95.16,96.12,96.99,95.93,97.31,96.38,95.73,96.13,94.97,92.57,94.45,98.05,96.63,96.57,96.12,94.27,94.82,95.27,92.09,96.21,96.86,94.11,94.44,95.32,95.21],
                    "2012":[96.47,93.57,94.27,96.91,95.01,92.94,93.96,95.34,96.01,96.28,94.75,96.53,96.11,95.62,96.08,97.31,94.31,95.81,93.86,94.89,97.08,95.17,96.76,94.81,95.39,95.86,95.45,94.93,96.22,94.57,93.21,94.40,96.85,94.37,95.24,94.67,95.14,95.42,95.71,96.46,96.66,97.43,95.73,96.00,97.14,96.09,96.56,96.79,96.31,95.62,94.80,96.58,93.37,93.73,93.82,96.83,95.97,97.18,96.44,96.42,96.34,96.32,96.48,95.23,96.77,93.81,95.60,96.75,96.71,96.08,96.32,94.49,96.16,95.96,96.46,95.20,95.58,93.92,96.75,95.59,95.02,95.64,96.02,95.33,96.56,95.46,95.54,96.53,96.21,96.64,96.58,96.07,95.28,96.51,96.47,95.69,95.34,96.36,97.12,96.99,95.89,96.18,94.30,93.42,95.79,95.87,95.00,96.04,97.41,96.75,96.42,95.31,94.98,95.08,96.97,94.26,96.75,95.83,95.76,96.85,95.86,95.02,93.87,95.21,96.65,96.36,96.03,95.29,95.14,94.95,95.55,96.93,96.03,96.22,97.00,95.96,95.92,95.62,93.53,93.14,96.30,95.72,96.55,96.22,95.41,96.21,95.75,95.94,96.77,96.13,94.56,95.61,92.96,95.77,95.10,95.47,95.46,94.56,96.47,95.90,97.06,96.61,96.51,96.97,95.28,96.50,96.02,95.53,95.22,94.67,95.72,95.83,94.87,96.44,96.95,95.07,96.87,96.54,96.56,96.23,96.16,96.36,95.38,95.26,97.00,95.99,97.65,96.51,95.69,96.36,94.94,92.86,94.95,97.69,96.39,96.79,96.41,93.76,95.60,96.02,92.96,96.07,96.91,93.80,95.21,95.19,94.69]
                }
            },
            grd3:{
                show:true,
                name:"Reading 3rd Grade",
                color:'#6666FF',
                title_1:"FCAT Reading",
                title_2:"Results Percentage of 3rd Grade Students Who Scored a Level 3 or Higher",
                axis:{
                    x:{
                        splits:[9.00,26.20,43.40,60.60,77.80,95.00],
                        title:"Percentage in Achievement Levels 3 and Above"
                    },
                    y:{
                        domain:[0,100],
                        //ticks:20,        
                        title:"Number of Schools"
                    }
                },
                data:{
                    "2009":[78,78,32,32,46,82,82,78,78,47,57,60,76,76,80,59,73,72,72,72,75,75,90,59,74,30,57,57,50,57,70,66,56,57,43,46,54,42,45,88,56,63,63,57,41,78,65,74,83,90,56,78,78,67,78,74,84,84,70,56,30,30,75,54,43,42,67,62,62,84,70,70,88,70,85,74,77,64,32,81,48,72,70,73,43,70,71,45,45,64,62,60,71,71,38,56,61,57,88,41,77,80,72,59,83,68,51,79,79,86,86,73,48,48,84,84,77,43,43,64,64,39,72,34,54,66,73,91,91,79,63,63,61,64,70,70,38,68,71,58,58,66,56,61,46,40,40,44,63,82,82,55,63,56,58,46,70,54,57,57,70,45,82,35,41,81,67,62,77,59,72,82,53,89,45,34,37,47,47,74,55,62,61,48,45,78,78,74,70,77,59,54,52,80,51,56,75,75,55,58,72,74,69,91,91,75,68,48,48,51,80,80,55,62,73,77,87,77,66,75,72,72,63,48,76,79,92,92,55,33,38,51,35,69,81,81,50,69,65],
                    "2010":[78,78,45,45,52,80,80,87,87,39,49,63,76,76,86,59,83,82,82,82,88,88,85,55,75,57,66,63,53,44,81,80,48,66,56,48,51,48,53,95,48,61,61,44,37,79,87,57,91,84,74,72,72,71,76,85,88,88,70,82,51,51,73,44,54,51,65,53,53,90,83,83,90,79,78,66,72,62,52,83,46,61,77,76,46,67,71,51,51,73,60,73,74,80,54,71,74,40,84,48,75,92,74,60,89,73,50,85,85,91,91,69,54,54,89,89,83,49,49,51,51,47,62,31,60,74,71,93,93,84,64,52,76,63,70,70,45,68,69,65,65,62,40,61,54,47,47,54,62,84,84,68,42,49,56,54,75,71,55,55,76,47,73,52,54,80,66,63,73,52,63,65,61,91,59,45,49,45,45,78,57,56,66,67,50,84,84,68,80,76,63,63,66,80,54,63,63,63,64,53,83,75,71,88,88,81,78,61,61,66,86,86,60,81,83,68,91,80,76,56,71,71,68,57,87,74,90,90,55,32,43,47,38,82,80,80,42,56,59],
                    "2011":[77,77,40,40,42,83,83,81,81,42,50,58,73,73,76,54,86,86,72,72,87,87,82,48,79,58,60,62,50,53,89,71,53,77,45,58,42,46,40,89,52,60,60,37,44,79,68,76,89,82,63,68,68,61,74,80,87,87,71,49,49,49,82,56,45,44,78,47,47,90,81,81,86,69,89,71,72,57,48,78,51,55,68,81,34,71,77,50,50,71,54,55,70,76,54,54,70,70,85,40,76,89,73,64,88,88,60,75,75,89,89,64,46,50,92,92,82,50,50,63,63,31,67,29,50,58,69,95,95,69,54,50,49,69,72,72,34,73,77,63,63,49,61,38,43,52,52,50,58,91,91,49,55,46,60,53,61,68,71,71,76,54,74,45,48,92,68,61,75,70,65,69,46,91,45,37,47,48,48,75,62,64,55,44,44,72,72,79,70,75,66,49,59,79,48,49,69,69,59,66,80,91,45,92,92,81,73,53,53,68,81,81,70,68,83,69,92,74,65,72,65,65,70,66,85,89,90,90,59,30,43,42,57,79,85,85,41,69,58],
                    "2012":[61,61,24,24,25,71,71,73,73,28,34,53,68,68,65,45,82,69,69,69,77,77,85,26,60,34,42,42,39,37,66,61,32,48,39,43,23,25,21,77,9,46,46,35,32,58,51,42,86,73,52,57,57,43,62,66,68,68,54,54,31,31,59,43,32,21,56,23,23,84,63,63,76,58,71,51,51,46,24,63,30,34,62,64,33,54,64,29,29,55,41,47,63,60,33,41,53,40,78,22,55,66,69,55,74,63,34,73,73,80,80,46,38,41,77,77,74,32,32,40,40,29,28,22,30,23,69,79,79,80,54,42,47,48,71,71,19,58,62,47,47,48,46,28,28,34,34,32,40,77,77,35,29,32,42,25,53,54,50,50,68,19,56,32,18,77,58,43,64,44,44,65,43,81,30,22,35,16,16,62,44,43,37,30,31,62,62,60,61,77,42,31,33,57,25,37,52,52,52,42,64,77,31,84,84,70,76,37,37,41,62,62,39,48,62,53,92,75,47,51,56,56,50,61,66,49,76,76,56,30,23,30,56,60,80,80,10,42,35]
                },
                
            },
            attn_m:{
                show:true,
                name:"Attendance Middle School",
                color:'#FFE303',
                title_1:"Attendance Rates for Middle Schools",
                title_2:"",
                axis:{
                    x:{
                        splits:[86.00, 88.40, 90.80, 93.20, 95.60, 98.00],
                        title:"Attendance Rates (%)"
                    },
                    y:{
                        domain:[0,60],
                        title:"Number of Schools"
                    }
                },
                data:{
                    "2009":[96.7,93.99,96.62,95.79,96.94,96.36,96.61,96.25,96.01,96.82,94.27,96.71,96.5,96.2,96.36,96.35,97.51,95.24,96.92,97.41,97.26,96.78,94.98,96.22,97.1,94.12,95.8,95.69,96.21,97.03,95.86,95.89,95.84,96.57,97.16,93.79,96.68,96.15,93.46,95.36,94.45,96.85,91.59,94.6,94.3,95.29,96.15,95.52,91.43,96.23,95.69,95.71,96.61,95.44,95.91,95.3,95.62,94.71,97.12,95.36,93.2,92.77,92.95,93.91,95.61,93.82,95.37,94.96,94.94,95.54,93.95,96.23,94.97,96.78,96.54,94.34,95.19,96.51,92.45,95.4,94.43,94.84,96.58,95.64,95.99,96.89,95.43,97.13,95.79,92.83,93.34,94.84,93.77,93.19,93.12,93.12,94.48],
                    "2010":[96.38,94.01,96.65,95.45,96.25,95.47,96.2,95.67,95.94,96.61,94.04,96.41,96.16,96.07,96.3,96.3,97.08,94.95,96.04,97.37,96.84,95.83,95.14,96.22,96.76,93.86,95.42,94.82,95.75,97.06,95.92,96.23,95.16,96.43,97.08,92.87,96.56,96.22,93.53,95.26,94.62,96.01,90.85,94.07,93.5,94.83,95.5,95.09,91.49,96.22,95.77,95.65,96.27,95.85,95.47,94.83,95.74,94.68,97.13,94.77,92.17,93.75,93.81,93.77,95.19,93.19,94.7,95.32,94.5,95.18,92.51,95.8,95.51,96.51,96.48,94.97,95.05,96.73,92.48,95.15,93.75,94.54,96.23,95.44,96.03,96.97,94.83,96.57,95.06,92.98,93.81,95.22,94.01,93.09,92.95,92.87,94.18],
                    "2011":[96.24,93.83,96.97,95.51,96.07,95.3,96.09,95.52,95.85,96.62,94.34,95.6,96.06,95.83,96.38,96.16,97.27,95.64,96.16,97.47,96.77,95.84,95.19,95.56,96.56,94.09,95.6,94.31,95.65,97.09,95.5,96.38,94.97,96.57,96.86,93.07,96.72,95.51,93.91,95.79,94.25,96.47,91.77,94.11,93.63,94.71,95.4,95.07,93.37,96.02,95.02,96.07,96.78,95.92,94.99,95.27,95.03,94.49,96.86,94.98,92.23,86.02,92.81,94.44,95.92,92.64,95.63,94.98,94.63,95.56,91.95,95.31,95.19,96.23,96.47,95.17,95.25,97.29,92.56,95.19,94.35,94.73,96.95,95.21,96.34,96.57,95.64,97.32,95.16,93.51,94.98,95.0,94.09,92.46,91.91,92.79,94.06],
                    "2012":[96.47,93.57,96.91,95.01,96.01,95.62,96.08,95.24,96.00,96.79,94.80,95.97,96.44,96.46,96.51,96.47,97.12,95.89,96.18,97.41,96.97,95.76,95.21,96.03,97.00,92.96,95.90,94.67,95.72,96.87,96.23,96.36,94.94,96.79,96.91,91.29,96.90,95.08,91.52,94.98,92.59,96.27,90.29,93.47,93.70,93.63,95.11,,93.34,95.31,94.57,95.37,96.30,95.31,94.19,94.97,93.86,93.72,96.82,94.94,90.70,90.59,92.53,93.53,95.73,91.77,94.97,95.10,94.18,95.35,92.09,95.13,95.03,95.55,96.14,93.91,95.00,96.89,91.26,95.21,94.72,94.65,96.26,94.69,96.30,96.58,95.87,97.32,94.48,93.61,94.76,94.98,94.24,92.33,92.66,93.34,94.07,]
                },
                
            },
            attn_h:{
                show:true,
                name:"Attendance High School",
                color:'#6666FF',
                title_1:"Attendance Rates for  High Schools",
                title_2:"",
                axis:{
                    x:{
                        splits:[88.00, 89.80, 91.6, 93.40, 95.20, 97.00],
                        title:"Attendance Rates (%)"
                    },
                    y:{
                        domain:[0,20],
                        title:"Number of Schools"
                    }
                },
                data:{
                    "2009":[94.71,94.84,92.83,95.38,93.34,94.09,94.19,94.41,91.56,94.63,90.69,95.77,93.78,91.63,94.84,90.3,94.48,91.4,91.93,94.37,91.61,90.91,93.77,94.29,95.14,93.19,93.5,95.01,91.95,93.99,93.12,96.29,93.12,94.48,92.17],
                    "2010":[94.68,94.54,92.98,94.17,93.81,94.16,93.38,94.39,91.42,94.21,91.08,95.56,92.42,92.1,95.22,90.79,94.3,92.01,92.03,94.2,93.63,91.1,94.01,93.95,95.46,93.09,93.63,93.1,91.27,93.77,92.95,96.17,92.87,94.18,92.92],
                    "2011":[94.49,94.73,93.51,94.79,94.98,93.58,92.93,93.98,92.57,93.73,89.96,95.31,92.66,93.23,95.0,89.43,94.14,93.16,93.4,94.32,94.53,89.99,94.09,92.82,95.43,92.46,93.75,92.53,91.81,93.21,91.91,96.45,92.79,94.06,91.99],
                    "2012":[93.72,94.65,93.61,94.83,94.76,94.26,92.57,94.42,92.14,93.61,88.22,95.07,92.73,91.14,94.98,89.49,94.33,91.26,93.72,93.47,93.47,91.22,94.24,93.37,95.27,92.33,92.05,93.99,92.51,93.45,92.66,95.89,93.34,94.07,91.70]
                },
                
            },
            grd8r:{
                show:true,
                name:"Reading 8th grade",
                color:'#FFE303',
                title_1:"FCAT Reading",
                title_2:"Results Percentage of 8th Grade Students Who Scored a Level 3 or Higher",
                axis:{
                    x:{
                        splits:[18.00, 32.40, 46.80, 61.20, 75.60, 90.00],
                        title:"Percentage in Achievement Levels 3 and Above"
                    },
                    y:{
                        domain:[0,60],
                        title:"Number of Schools"
                    }
                },
                data:{
                    "2009":[67,67,47,47,65,65,60,60,61,61,58,58,77,77,32,32,48,48,90,90,76,76,52,52,62,62,52,52,51,51,70,70,22,57,27,52,23,23,33,26,31,53,52,19,62,54,41,61,55,41,60,35,33,33,50,38,41,28,20,32,57,20,50,42,57,32,36,44,23,43,72,25,47,33,46,39,36,36,56,43,43,69,71,48,72,40],
                    "2010":[68,68,73,73,79,79,51,51,60,60,69,69,64,64,61,61,83,83,39,39,45,45,84,84,68,68,55,55,64,64,48,48,54,54,56,56,63,63,24,64,20,58,25,27,41,28,43,53,53,21,61,45,43,55,62,39,64,43,26,26,50,38,30,20,18,29,56,30,53,46,54,39,36,51,30,46,78,29,54,56,31,55,44,51,51,58,46,46,67,77,48,74,38],
                    "2011":[63,63,29,29,69,69,70,70,55,55,59,59,73,73,52,52,59,59,75,75,74,74,60,60,90,90,77,77,38,38,47,47,83,83,65,65,46,46,38,38,68,68,36,36,48,48,66,66,86,86,70,70,27,68,48,30,44,27,62,22,35,24,35,47,43,26,73,47,44,64,61,39,56,34,25,25,49,38,35,40,26,37,55,25,51,49,58,41,36,48,31,42,76,31,54,49,28,59,41,51,51,64,43,43,71,72,41,76,44],
                    "2012":[71,71,37,37,67,67,74,74,59,59,77,77,73,73,51,51,51,63,63,68,68,63,63,71,71,72,72,76,76,37,37,48,48,84,84,71,71,62,62,44,44,70,70,38,38,46,46,60,60,75,75,71,71,28,70,40,33,54,26,66,24,38,30,38,54,25,61,41,48,61,57,41,61,38,24,24,48,36,34,24,22,42,54,24,54,45,54,51,38,46,37,43,76,30,57,49,35,51,55,50,50,64,42,42,67,75,48,75,42]
                },
                
            },
            grd8m:{
                show:true,
                name:"Math 8th grade",
                color:'#FFE303',
                title_1:"FCAT Math",
                title_2:"Results Percentage of 8th Grade Students Who Scored a Level 3 or Higher",
                axis:{
                    x:{
                        splits:[21.00, 36.00, 51.00, 66.00, 81.00, 96.00],
                        title:"Percentage in Achievement Levels 3 and Above"
                    },
                    y:{
                        domain:[0,60],
                        title:"Number of Schools"
                    }
                },
                data:{
                    "2009":[81,81,62,62,69,69,70,70,76,76,69,69,88,88,43,43,58,58,96,96,83,83,65,65,80,80,64,64,79,79,78,78,32,65,42,53,35,36,45,37,42,65,63,32,78,62,61,72,62,48,73,50,51,51,64,54,64,36,35,45,68,29,65,50,73,40,44,62,30,56,79,39,55,42,60,51,52,52,73,50,50,76,80,62,83,61],
                    "2010":[82,82,86,86,91,91,64,64,70,70,80,80,80,80,77,77,88,88,47,47,52,52,89,89,78,78,64,64,86,86,70,70,63,63,76,76,78,78,39,74,39,59,37,37,55,40,49,69,58,32,80,53,64,65,68,52,70,54,33,33,61,53,55,34,39,44,72,48,70,57,66,42,37,66,31,55,83,36,63,68,41,66,52,60,60,73,54,54,78,85,63,81,53],
                    "2011":[77,77,35,35,88,88,85,85,72,72,79,79,90,90,73,73,70,70,92,92,83,83,80,80,91,91,91,91,69,69,66,66,96,96,84,84,69,69,81,81,85,85,61,61,64,64,80,80,84,84,88,88,38,80,65,44,46,46,74,41,47,36,42,64,49,42,76,52,65,71,65,49,65,46,48,48,67,59,70,42,49,56,71,54,73,65,71,68,39,65,49,64,83,41,66,63,34,67,59,58,58,80,51,51,84,82,65,83,62],
                    "2012":[69,69,39,39,78,78,77,77,70,70,71,71,84,84,35,52,52,64,64,74,74,56,56,75,75,83,83,78,78,45,45,59,59,92,92,67,67,62,62,83,83,84,84,55,55,61,61,51,51,71,71,79,79,28,74,48,29,34,24,61,35,34,26,30,60,21,60,37,54,60,49,34,59,36,41,41,49,44,59,43,36,47,57,34,56,47,57,50,31,57,40,51,74,34,54,55,23,54,50,43,43,73,32,32,75,81,45,67,43]
                },
                
            },
            grd10:{
                show:true,
                name:"Reading 10th Grade",
                color:'#6666FF',
                title_1:"FCAT Reading",
                title_2:"Results Percentage of 10th Grade Students Who Scored a Level 3 or Higher",
                axis:{
                    x:{
                        splits:[5.00,17.00,29.00,41.00,53.00,65.00],
                        title:"Percentage in Achievement Levels 3 and Above"
                    },
                    y:{
                        domain:[0,15],
                        title:"Number of Schools"
                    }
                },
                data:{
                    "2009":[26,26,19,35,35,32,23,46,19,41,16,24,36,9,47,47,10,34,8,7,35,12,15,56,56,21,29,34,34,24,16,16,37,16,16,38,37,37,35,35,6],
                    "2010":[26,26,26,39,39,43,25,50,21,47,18,32,40,11,54,54,12,39,9,9,43,15,16,57,57,29,30,37,37,32,17,26,34,21,21,40,38,38,39,39,10],
                    "2011":[27,27,31,42,42,42,30,53,26,53,19,33,42,15,52,52,12,43,7,9,40,12,11,52,52,25,33,35,35,30,19,28,31,19,19,39,42,42,41,41,13],
                    "2012":[38,38,41,49,49,49,37,57,37,58,24,44,50,21,59,59,16,47,19,20,48,23,26,65,65,34,43,42,42,39,31,37,42,33,33,52,40,40,50,50,17]
                },
                
            },
            grad:{
                show:true,
                name:"Graduation High Scools",
                color:'#6666FF',
                title_1:"Graduation Rates for High Schools",
                title_2:"",
                axis:{
                    x:{
                        splits:[0.00,18.40,36.80,55.20,73.60,92.00],
                        title:"Graduation Rates (%)"
                    },
                    y:{
                        domain:[0,25],
                        title:"Number of Schools"
                    }
                },
                data:{
                    "2009":[0,0,70.9,70.9,0,67.5,67.5,72.6,70.6,81.2,66.4,81.4,59.3,64.1,59.6,87.5,87.5,63.8,77.8,48.7,59.9,80.7,59.9,67.4,84.1,84.1,68.6,70,83.2,83.2,72.7,63.4,62.2,66.5,59.2,59.2,81.8,67.5,67.5,83,83,53.1],
                    "2010":[74.49,74.49,69.25,70.33,70.33,78.8,78.12,84.71,71.42,87.14,60.91,0,72.87,64.35,91.19,91.19,65.25,72.36,69.11,68.09,79.77,64.8,71.9,88.73,88.73,72.64,80.79,83.4,83.4,78.34,65.76,73.54,72.75,64.4,64.4,83.65,67.65,67.65,80.07,80.07,69.59],
                    "2011":[0,0,0,0,74.2671009772,74.2671009772,66.5914221219,81.527936146,81.527936146,74.2508324084,68.584579977,80.0892857143,62.8975265018,88.6234357224,54.1582150101,75.3022452504,70.703125,62.9399585921,89.837398374,89.837398374,58.4466019417,76.4127764128,62,74.4897959184,78.2442748092,72.2388059701,64.4351464435,85,85,67.2727272727,72.7463312369,78.6647314949,78.6647314949,75.5988023952,58.4635416667,64.247311828,66,67.6751592357,67.6751592357,82.2751322751,69.5798319328,69.5798319328,81.5943728019,81.5943728019,69.2567567568],
                    "2012":[0,0,0,0,0.754,0.754,0.6772,0.8266,0.8266,0.7536,0.71,0.8098,0.6448,0.8976,0.5943,0.7616,0.7187,0.6521,0.9044,0.9044,0.633,0.7776,0.66,0.7959,0.7951,0.7761,0.6882,0.8725,0.8725,0.6987,0.7631,0.7982,0.7982,0.7814,0.621,0.6639,0.6671,0.6894,0.6894,0.8333,0.7294,0.7294,0.8288,0.8288,0.7533]
                },
                
            },        
            drop:{
                show:true,
                name:"Drop High Schools",
                color:'#6666FF',
                title_1:"Dropout Rates for High Schools",
                title_2:"",
                axis:{
                    x:{
                        splits:[0.00,1.80,3.60,5.40,7.20,9.00],
                        title:"Dropout Rates (%)"
                    },
                    y:{
                        domain:[0,25],
                        title:"Number of Schools"
                    }
                },
                data:{
                    "2009":[1.1,1.1,2.5,2.5,2.2,4.3,4.3,4.6,2.6,2.7,3,0.9,5.5,2.3,3.1,4.2,2.5,2.5,8.9,2.8,5.3,5,2.8,8.3,4.8,1.9,1.9,3,2.9,1.7,1.7,2.1,6.2,5.3,4.4,7.6,7.6,2.2,4.7,4.7,1.6,1.6,6.5],
                    "2010":[0.00,2.34,2.34,2.81,4.44,4.44,3.41,2.90,2.98,3.28,1.56,7.08,1.60,2.66,5.90,0.83,0.83,4.74,4.91,5.81,5.99,4.23,4.23,3.35,3.00,3.00,2.83,1.90,4.13,4.13,1.55,4.34,4.33,3.66,5.64,5.64,2.42,6.59,6.59,3.14,3.14,6.25],
                    "2011":[0,0,0,0,2.6,2.6,5.1,2.6,2.6,2.7,2.7,2.1,4.5,1,4.3,3.4,1.9,2.7,0.9,0.9,5.4,1.9,2.7,2.4,4.1,4.6,5,2.6,2.6,4,2,2.6,2.6,1.4,6.6,3.8,6.7,3.5,3.5,1.6,3.9,3.9,1.4,1.4,7.8,],
                    "2012":[1.6,1.6,1.5,1.8,1.8,0.6,0.4,1.9,1.5,1.9,3.2,1,1.1,1.2,1.5,1.5,4,2.9,4.7,2.4,2.1,5,3.1,2.2,2.2,4.2,0.9,2.1,2.1,2.6,2.6,2.6,1.3,2.6,2.6,1.8,1.7,1.7,1.6,1.6,2.7]
                },
                
            },        
        
                 }
        $scope.counter=-1;
        var activeVarIndex=-1;
        $scope.dataCategories=[];
        $scope.animHandler;
        $scope.isRunning=false;
        $scope.variableNames=[];
        
        for(var i in $scope.variables){
            if(i.match(/\$/))
                continue;
                $scope.variableNames.push(i);
            }
        
        function StartAnimation(){
            $timeout.cancel($scope.animHandler);
           $scope.counter=-1;
            NextFrame();
        }
        
        function NextFrame(){
            $scope.isRunning=true;
            if($scope.counter>=$scope.dataCategories.length-1){
                $scope.isRunning=false;
                return false;
            }
            ++$scope.counter;
                RunCurrentFrame();
                
        }
        
        function RunCurrentFrame(){
            $scope.activeYear=$scope.dataCategories[$scope.counter];
            $scope.animHandler=$timeout(function(){NextFrame()},10000);
        }
        
        $scope.PauseAnim=function(){
             $timeout.cancel($scope.animHandler);
            $scope.animHandler=null;
            $scope.isRunning=false;
        }
        
        $scope.PlayAnim=function(){
             NextFrame();
        }
        $scope.RestartAnim=function(){
             var name=$scope.activeVar;
             $timeout(function(){
                 $scope.SetActiveVar(activeVarIndex);
             })
             
        }
        
        
        $scope.SetActiveVar=function(idx){
            activeVarIndex=idx;
            $scope.dataCategories=[];
            $scope.activeVar=$scope.variableNames[idx];
            for(var i in $scope.variables[$scope.activeVar].data){
            if(i.match(/\$/))
                continue;
                $scope.dataCategories.push(i);
            }
            StartAnimation();
        }
        
        $scope.SetActiveYear=function(idx){
            $scope.PauseAnim();
            $scope.counter=idx;
            $scope.activeYear=$scope.dataCategories[idx];
        }
        
        $scope.SetActiveVar(0);
        
      } 
     ChartsCtrl.$inject=['$scope','$window','$timeout','$location','$filter'];
    
    function MapsCtrl($scope,$window,$timeout,$location,$filter,$rootScope){

       $scope.variable=-1;
       
       $scope.variables=[
           {
               name:'1468',
               tag:'Female Households',
           },
           {
               name:'1468_dismiss',
               tag:'Female Households (Pulse)',
           },
           {
               name:'1466',
               tag:'3rd Grade Reading'
           },
          /* {
               name:'edu',
               tag:'3rd Grade Reading (Vector)'
           },*/
           {
               name:'1438',
               tag:'Crime'
           },
           {
               name:'1438z',
               tag:'Crime (Zonal)'
           },
           {
               name:'1455',
               tag:'Health Care',
           },
           {
               name:'1373',
               tag:' Public Transit',

           },
           {
               name:'1377',
               tag:'Supermarkets',
           },
           /*{
               name:'1187',
               tag:'Bike Paths',

           },
           {
               name:'1168',
               tag:'Fine Dining',

           },
           
           {
               name:'1188',
               tag:' Pizza',

           }*/
           
           
       ]
        $scope.SetActiveVar=function(idx){
            $scope.variable=idx;
        }
        
        $scope.ToggleEdu=function(){
            $rootScope.$broadcast('toogleEdu',true);
        }
        
        $scope.ToggleCrime=function(){
            $rootScope.$broadcast('toogleCrime',true);
        }
 
        $scope.SetActiveVar(0);
        
      } 
     MapsCtrl.$inject=['$scope','$window','$timeout','$location','$filter','$rootScope'];
    
     function MapsCtrlSmall($scope,$window,$timeout,$location,$filter,$rootScope){

       $scope.variable=-1;
       $scope.title="Spatial Variation of Impact of Female Householder on 3rd Grade Reading Level ";
       $scope.variables=[
           {
               name:'1471',
               tag:'Coefficient',
           }
       ]
        $scope.SetActiveVar=function(idx){
            $scope.variable=idx;
        }
        
        $scope.ToggleEdu=function(){
            $rootScope.$broadcast('toogleEdu',true);
        }
        
        $scope.ToggleCrime=function(){
            $rootScope.$broadcast('toogleCrime',true);
        }
 
        $scope.SetActiveVar(0);
        
      } 
     MapsCtrlSmall.$inject=['$scope','$window','$timeout','$location','$filter','$rootScope'];
    
    
    
    
    
      
      
