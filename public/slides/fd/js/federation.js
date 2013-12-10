      var AP=angular.module("aboutPlace", ['ngRoute','ngTouch','ngAnimate','ui.directives','ui.bootstrap','LocalServices','Directives','customFiltersModule'/*,'MapModule'*/]) 
      .config(['$routeProvider','$locationProvider','$interpolateProvider', function($routeProvider,$locationProvider,$interpolateProvider) {
        $routeProvider.when('/', {templateUrl: 'views/decisions.html'}).
        when('/first', {templateUrl: 'views/firstmap.html', controller: FristMapCtrl}).
        when('/variables', {templateUrl: 'views/variables.html'}).
        when('/maps', {templateUrl: 'views/maps.html', controller: MapsCtrl}).
	otherwise({redirectTo: '/'});
//$locationProvider.html5Mode(true);

}]);
      
      function AppController($scope,$window,$http,$timeout,$rootScope,$dialog,$routeParams,$location){
          
          $scope.slides=["","first","variables","maps"];
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
     

    function MapsCtrl($scope,$window,$timeout,$location,$filter,$rootScope){

       $scope.variable=-1;
       
       $scope.variables=[
           {
               name:'1373',
               tag:' Public Transit',

           },
           {
               name:'1377',
               tag:'Supermarkets',
           },
           {
               name:'1168',
               tag:'Fine Dining',
           },
           {
               name:'federation',
               tag:'Combined SMARTMapp of all 3 services',
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
     MapsCtrl.$inject=['$scope','$window','$timeout','$location','$filter','$rootScope'];
    
     function FristMapCtrl($scope,$window,$timeout,$location,$filter,$rootScope){

       $scope.variable=-1;
       $scope.title="4200 Biscayne Blvd, Miami, FL, United States";
       $scope.variables=[
           {
               name:'-xxx1',
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
     FristMapCtrl.$inject=['$scope','$window','$timeout','$location','$filter','$rootScope'];
    
    
    
    
    
      
      
