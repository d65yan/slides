      var AP=angular.module("aboutPlace", ['ngRoute','ngTouch','ngAnimate','ui.directives','ui.bootstrap','Reports','LocalServices','Directives','customFiltersModule'/*,'MapModule'*/]) 
      .config(['$routeProvider','$locationProvider','$interpolateProvider', function($routeProvider,$locationProvider,$interpolateProvider) {
        $routeProvider.when('/?', {templateUrl: 'views/nhbds_mega.html', controller: nhbdCtrl,reloadOnSearch:false}).
        when('/:nocache?', {templateUrl: 'views/nhbds.html', controller: nhbdCtrl,reloadOnSearch:false}).
	otherwise({redirectTo: '/'});
//$locationProvider.html5Mode(true);
        $interpolateProvider.startSymbol('{/{');
        $interpolateProvider.endSymbol('}/}');

}]);
      
      function AppController($scope,$window,$http,$timeout,SelectionService,GeograficService,SystemsFilters,$rootScope,$dialog,$routeParams,$location){
          //$scope.logged=false;
          $rootScope.history = [];
          $rootScope.back=false;
          $rootScope.same=false;
          $scope.geo=GeograficService;
          $scope.selection=SelectionService;
          $scope.showAuthBox=false;
          $scope.showAuthBoxForm=true;
          $scope.authInProcess=false;
          $scope.prevContent='';
          $scope.footerState='100%';
          $scope.selectedLifeStyle=-1;
          $scope.authUrl=$scope.authServer+'auth?srd=app/authsuccess&t='+Date.now();
          //$scope.user={};
          $scope.showCities=false;
          $scope.token=null;
          $scope.searchDialog;
          $scope.authHeader='';
          $scope.statusTimer=null;
          $scope.goBack=function(){
              $window.history.back();
          }
          
          $scope.goNext=function(){
              if($scope.childView && angular.isFunction($scope.childView.GoNext))
                  $scope.childView.GoNext();
          };
          $scope.addressChanged=false;
          $scope.UpdateSpots=function(){
              if(!$scope.geoLoc){
                 $scope.$broadcast('submitionError','address');
                 return;
              }
                  
               $scope.selection.SelectLifeStyle($scope.selectedLifeStyle);
               if($scope.addressChanged)
                $rootScope.$broadcast('locationChange',$scope.geoLoc);
            
              $timeout(function(){$scope.$broadcast('updateSpots');})
               $scope.addressChanged=false;
          };
          
          $scope.CollapseAll=function(){
              $rootScope.$broadcast('collapse',-1);
          }
          
          
          
          
          $scope.$on('$routeChangeStart',function(next,current,previous){
              $scope.childView=null;
              $rootScope.history=localStorage['u4m.APapp.history']||'[]';
              var path=current.originalPath;
              for(var i in current.params){
                  var reg=new RegExp(':'+i);
                  path=path.replace(reg,current.params[i]);
              }
              
              
              
              
              $rootScope.history=JSON.parse($rootScope.history);
              
              $rootScope.same= $rootScope.history[$rootScope.history.length-1]?$rootScope.history[$rootScope.history.length-1].match(current.regexp):false;
                if($rootScope.history.length>1){
                    if($rootScope.history.lastIndexOf(path)>=($rootScope.history.length-2)){
                        $rootScope.back=true;
                        $rootScope.history.pop();
                        localStorage['u4m.APapp.history']=JSON.stringify($rootScope.history);
                        return;
                    }
                }
                    $rootScope.back=false;
                    $scope.history.push(path);
                    localStorage['u4m.APapp.history']=JSON.stringify($rootScope.history);
          });
  
          
          
          

          $scope.ShowCities=function(){
              for(var i=0;i<$scope.geo.regions.length;i++){
                 $scope.geo.regions[i].SelectAll();
              }
             $scope.show_cities=!$scope.show_cities;
          };

          $scope.SelectArea=function(area){
              $scope.selectedArea=area;
              $scope.geo_filter=area.name;
              $scope.show_cities=false;
              
          }



            $scope.failedSearchOpts = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: 'views/searchfailed_dialog.html',
                controller:'dialogCtrl'
            };

            $scope.searchDialog=$dialog.dialog($scope.failedSearchOpts);
            $scope.searchFailed = function(){
                $scope.searchDialog.open().then(function(){});
            };
            
          
          
          $scope.ShowPlainAuth=function(url,force){
            $scope.prevContent='';
            $scope.AuthBoxToggle(url,force);
          }
          
          
          $scope.AuthBoxToggle=function(url,force){
              if($scope.authInProcess)
                  return;
              
              $scope.showAuthBox=!$scope.showAuthBox &&(!$scope.logged || force);
              $scope.authUrl='';
              $timeout(function(){
                   $scope.authUrl=$scope.authServer+url;
                   
                   //$scope.$p
              })
          }
          
          $scope.CheckAuth=function(msg){
              if($scope.logged && $scope.user && $scope.user.token)
                  return true;
              if(msg){
                 $scope.prevContent=msg; 
                 $scope.showAuthBoxForm=false;
              }
              $scope.AuthBoxToggle('login?srd=app/authsuccess&full=1');
              return false;
          }
          
           $scope.state='';

          $scope.Logout=function(){
              
              $http(
              {
                  method:'GET',
                  url:('logout?t='+$scope.user.token)
              }).success(function(data){

                      $scope.logged=false;
                      $scope.user={};
                      $scope.authUrl=$scope.authServer+'logout';
                      $window.location.href='/#home';
                  
             });
          }

          
          
          
          $scope.Register=function(m,t){
              $scope.showAuthBox=false;
              if(m=='local')
                  LocalAuth(t);
              else
                SocialAuth(m);  
          }


        function SocialAuth(m){
                $scope.showAuthBox=false;
                $scope.authInProcess=true;
                
                var vid='verification_id_'+new Date().getTime();
                $scope.status='Authenticating through'+m;
                $http.get('authenticating?vid='+vid).success(function(d){
                     $scope.status=d.msg;
                     $timeout(function(){$scope.status=''},2500)
                     if(d.success){
                           $scope.logged=true;
                           delete d.success;
                           $scope.user=d;
                           $scope.$broadcast('authSuccess');
                     }
                     else
                         $scope.$broadcast('authFailed');
                     $scope.authInProcess=false;
                     
                }).error(function(e){
                      $scope.authInProcess=false;
                      var a=e;
                      $scope.$broadcast('authFailed');
                });
                          
                $timeout(function(){
                    myPopup=window.open($scope.authServer+'auth/'+m+'?vid='+vid,'','height=300,width=450');
                             if(myPopup)
                                   return
                              $dialog.messageBox('Error','You must enable Popups in order to authenticate through Social Media',[{label:'close',result:'no'}]).open();
                              $scope.authInProcess=false;
                              $scope.status='Authentication Error';
                              $timeout(function(){$scope.status=''},2500)
                          
                          },100);
         
          };
          
          
          function LocalAuth(t){
              $scope.status='Authenticating through aboutPlace';
              $http.get('localauth?t='+t).success(function(d){
                $scope.status=d.msg;
                delete d.msg;
                $timeout(function(){$scope.status=''},2500)
                if(d.success){
                      $scope.logged=true;
                      delete d.success;
                      $scope.user=d;
                      $scope.$broadcast('authSuccess');
                                  
                }
                else
                    $scope.$broadcast('authFailed');
                $scope.authInProcess=false;
              }).error(function(e){
                   var a=e;
                   $scope.authInProcess=false;
                   $scope.$broadcast('authFailed');
             });
          }


         // $scope.status='Loading Application Data';
         $scope.status='';

          SystemsFilters.GetTree(function(){
                $rootScope.$broadcast('lifestylesLoaded');
                
           });
          
         /*GeograficService.GetRegions(function(){
                    $rootScope.$broadcast('regionsLoaded');
                    $scope.status='';
                })*/
          
          $scope.FilterCitites=function(){
              $scope.geo_results=!$scope.geo_filter.length;
               $scope.show_cities=!$scope.geo_results;
              for(var i=0;i<$scope.geo.regions.length;i++){
                  if(!$scope.geo_filter.length){
                      $scope.geo.regions[i].SelectAll();
                      continue;
                  }
                  
                   $scope.geo.regions[i].UnselectAll();
                  $scope.geo.regions[i].filter_selection.name_zip=$scope.geo_filter;
                  $scope.geo.regions[i].ApplyFilters();
                  $scope.geo_results=  $scope.geo_results||$scope.geo.regions[i].some_selected;
              }
          }
  

          
          $scope.$on('addressSelected',function($event,location){
              $scope.geoLoc=location;
              $scope.addressChanged=true;
          });
          
          $scope.$on('elementSelected',function($event,elem){
              $scope.selectedLifeStyle=elem.value;
           });

    }
      AppController.$inject=['$scope','$window','$http','$timeout','SelectionService','GeograficService','SystemsFilters','$rootScope','$dialog','$routeParams','$location'];
     
     function homeCtrl($scope,$window,$timeout,GeograficService,SystemsFilters,$location,$filter){
         $scope.$parent.footerState='100%'; 
        
         $scope.$parent.helpSc=[
             {
                 letter:'r',
                 desc:'Select one of the provided Metropolitan Areas',
                 sel:'.msa-link'
                 
             }
         ];
          $scope.$parent.state='Home';
          $scope.$parent.status='';
         
         $scope.GoTo=function(str){
             $scope.$parent.status="Moving on";
             $timeout(function(){$location.path("/"+str);});
         };
         
         
         $scope.regions=GeograficService.regions;
         $scope.fregs=GeograficService.regions;
         $scope.relocaLife=SystemsFilters.relocaLife;
         $scope.travelLife=SystemsFilters.travelLife;
          $scope.lifestyles=SystemsFilters.lifestyles;
          $scope.hoveredCity=-1;
          $scope.activeRegion=0;
         
         
         
         var l=$scope.relocaLife.length>$scope.travelLife.length?$scope.relocaLife.length:$scope.travelLife.length;
         var tw=Math.floor(10/l)*10;
         var m=(100-tw*l)/(l*2);
         if(m===0){
             m=1;
             tw-=2;
         }
         $scope.lfMargin=m+'%';
         $scope.lfHeight=tw+'%';
         
         $scope.UpdateFilter=function(){
             
             $scope.fregs=$filter('getByname')($scope.regions,$scope.citiesFilter);
             $scope.activeRegion=0;
             
         }
         

         $scope.$on('regionsLoaded',function(){
            $scope.regions=GeograficService.regions; $scope.$apply();
             $scope.fregs=$filter('getByname')($scope.regions,$scope.citiesFilter);

         
            $timeout(function(){
                /*if(!CheckCookie("homeV")){
                    SetCookie("homeV",1,1);
                    intro=introJs();
                    intro.onexit(function(){delete intro; intro=null});
                    intro.oncomplete(function(){delete intro; intro=null});
                    //intro.start();
                }*/
             })
        })
        
        $scope.$on('lifestylesLoaded',function(){
         $scope.relocaLife=SystemsFilters.relocaLife;
         $scope.travelLife=SystemsFilters.travelLife;
            $scope.lifestyles=SystemsFilters.lifestyles; 
            //$scope.$apply();
            /*$timeout(function(){
                if(!CheckCookie("homeV")){
                    SetCookie("homeV",1,1);
                    intro=introJs();
                    intro.onexit(function(){delete intro; intro=null});
                    intro.oncomplete(function(){delete intro; intro=null});
                    //intro.start();
                }
             })*/
                        var l=$scope.relocaLife.length>$scope.travelLife.length?$scope.relocaLife.length:$scope.travelLife.length;
         var tw=Math.floor(10/l)*10;
         var m=(100-tw*l)/(l*2);
         if(m===0){
             m=1;
             tw-=2;
         }
         $scope.lfMargin=m+'%';
         $scope.lfHeight=tw+'%';
        })
        
        $scope.$on('viewAnimEnd',function(){
            $scope.update_scroll=Date.now();
        })
        
         if($scope.regions){
             $timeout(function(){
                /*if(!CheckCookie("homeV")){
                    SetCookie("homeV",1,1);
                    intro=introJs();
                    intro.onexit(function(){delete intro; intro=null});
                    intro.oncomplete(function(){delete intro; intro=null});
                    //intro.start();
                }*/
             })
         }
      } 
     homeCtrl.$inject=['$scope','$window','$timeout','GeograficService','SystemsFilters','$location','$filter'];
     
      function msaCtrl($scope,$window,$timeout,GeograficService,SystemsFilters,$routeParams,SelectionService,$dialog,$location,$http){
            $scope.$parent.footerState='100%'; 
                   $scope.$parent.helpSc=[];

                   $scope.$parent.childView=$scope;
                   $scope.$parent.status='';
          $scope.$parent.state='MSA';
          $scope.allowNext= SelectionService.cities.length?'':'disabled';
          $scope.addons=[];
          if(SystemsFilters.addons)
            $scope.addons=angular.copy(SystemsFilters.addons,$scope.addons);
          $scope.$on('citiesSelectionChanged',function(){
             $scope.allowNext= SelectionService.cities.length?'':'disabled';
             //$scope.$apply();
          })
          
           $scope.$on('addonsLoaded',function(){
                $scope.addons=SystemsFilters.addons;
               $scope.$apply();
            })
          
          $scope.advanceOptionsState='right';
          $scope.msa=null;
          $scope.boxSelect=false;
          $scope.hpupdate=null;
          $scope.overMap=false;
          $scope.selCity=null;
          $scope.prgtely=false;
          var idx=$routeParams.index;
          $scope.idx=idx;
          var ag=$routeParams.group||0;
          $scope.msa=GeograficService.SelectRegion(idx);
              

          $scope.$on('updateRegions',function(){
                $scope.msa=GeograficService.SelectRegion(idx);
                if(!$scope.msa)
                    return;
                $scope.SelectArea(ag,true);
                $scope.hpMin=$scope.msa.filter_selection.hp[0];
                $scope.hpMax=$scope.msa.filter_selection.hp[1];
                $scope.hpupdate=new Date().getTime();
                
                $scope.$apply();
            });
            
          $scope.$on('regionsLoaded',function(){
                $scope.msa=GeograficService.SelectRegion(idx);
                $scope.SelectArea(ag,true);
                $scope.hpMin=$scope.msa.filter_selection.hp[0];
                $scope.hpMax=$scope.msa.filter_selection.hp[1];
                $scope.hpupdate=new Date().getTime();
                
                $scope.$apply();
                /*$timeout(function(){
                    if(!CheckCookie("msaV")){
                        SetCookie("msaV",1,1);
                        intro=introJs();
                        intro.onexit(function(){delete intro; intro=null});
                        intro.oncomplete(function(){delete intro; intro=null});
                        //intro.start();
                    }
                })*/
            })

           
          $scope.$on('slider_change',function($event,value){
               if(!$scope.msa)
                   return;
               $scope.msa.filter_selection.hp[0]=value[0];
               $scope.msa.filter_selection.hp[1]=value[1];
                $scope.msa.ApplyFilters();
                
                var phase = $scope.$root.$$phase;
                
                if(phase != '$apply' && phase != '$digest')
                  $scope.$apply();
           })
          
          $scope.$on('collapse',function(){
              $scope.cityMenu=false;
          })
           
          $scope.ToogleCityMenu=function($event){
              if($event){
                $event.preventDefault();
                $event.stopPropagation();
              }
              $scope.cityMenu=!$scope.cityMenu;
              var phase = $scope.$root.$$phase;
                
                if(phase != '$apply' && phase != '$digest')
                  $scope.$apply();
           
          }
          
         $scope.ToogleAdvanceOptions=function(){
             if($scope.advanceOptionsState=='right')
                 $scope.advanceOptionsState='down';
             else
                  $scope.advanceOptionsState='right';
         }
           
           
         $scope.ToggleFilter=function(addon){
             addon.active=SelectionService.AddFilter(addon.id,true);
             if(!addon.active)
                 SelectionService.RemoveFilter(addon.id);
         }
         
         $scope.ClearAddons=function(){
             for(var i=0;i<$scope.addons.length;i++){
                // SelectionService.RemoveFilter($scope.addons[i].id)
                 $scope.addons[i].active=false;
             }
         }
         
         $scope.HighLightCity=function(gidx,idx,status){
             $scope.hoveredCity=-1;
            $timeout(function(){
               if($scope.msa.groups[gidx].cities[idx].mapIndex)
                $scope.mapControl.SelectCityByIdx($scope.msa.groups[gidx].cities[idx].mapIndex,status,true);
             else{
                 $scope.msa.groups[gidx].cities[idx].mapIndex=$scope.mapControl.SelectCityById($scope.msa.groups[gidx].cities[idx].id,status,true);
             } 
            }) 
             
         }
         
         
         $scope.SelectCityById=function(id,status){
          var city=$scope.msa.GetCityById(id);
            if(city){
                city.ToggleSelect(status,true,$scope.boxSelect);
                return city;
            }
            return null;
         }
         
         $scope.SelectArea=function(idx,force){
             if(idx===$scope.msa.activeGroup && !force)
                 return;
             $scope.msa.SetActiveGroup(idx);
             $scope.hpupdate=Date.now();
             /*for(var i=0;i<$scope.msa.groups[$scope.msa.activeGroup].cities.length;i++){
                 function call(idx){
                    var city=$scope.msa.groups[$scope.msa.activeGroup].cities[idx];
                    $http.get('api/g/'+city.id)
                 .success(function(g){
                        var feat={"type":'FeatureCollection',"features":[{"type":"Feature","properties":{id:city.id,name:city.name},"geometry":g.shape}]};
                        feat=$scope.mapControl.geojson_format.read(feat);
                        city.geometry=feat[0];
                        $scope.mapControl.AddCity(city.geometry);
                    });
                 }
                 call(i);
                 
             }*/
         }
         
         $scope.$on('cityStatusToggled',function($event,city){
             if(angular.isUndefined($scope.mapControl))
                 return;
             $scope.prgtely=true;
             if(city.parent.idx!==$scope.msa.activeGroup)
                 return;
             if(city.mapIndex||city.mapIndex===0)
                 $scope.mapControl.SelectCityByIdx(city.mapIndex,city.selected,false);
             else{
                city.mapIndex=$scope.mapControl.SelectCityById(city.id,city.selected,false);
             }
             $scope.prgtely=false;
         })
         
         $scope.ResetAll=function(){
               var title = 'Warning';
                var msg = 'Proceed to clear all selections??';
                var btns = [{result:'cancel', label: 'Cancel'}, {result:'ok', label: 'OK', cssClass: 'btn-primary'}];

                $dialog.messageBox(title, msg, btns).open().then(function(result){
                    if(result=='ok')
                        $scope.msa.UnselectAll();
                    //SelectionService.Clear();
                    //$scope.ClearAddons();
                    
                });
         }
     
         $scope.CitiesSelected=function(){
             if($scope.msa)
                return $scope.msa.GetSelCities().length>0
             return false;
         }
         
         $scope.Search=function(){
             if(!$scope.msa.filter_selection.name_zip.length)
                 return;
             
             $scope.$parent.searchFailed();
         }
         
         $scope.GoNext=function(){
             SelectionService.AddCities($scope.msa.GetSelCities());
             SelectionService.SetArea($scope.msa.groups[$scope.msa.activeGroup]);
             //$scope.msa.PurgeCities();
             $location.path("/nhbds/"+Date.now());
         }
         
         if($scope.msa){
                  $scope.SelectArea(ag,true);
                $scope.hpMin=$scope.msa.filter_selection.hp[0];
                $scope.hpMax=$scope.msa.filter_selection.hp[1];
                $scope.hpupdate=new Date().getTime();
                $timeout(function(){
                   /* if(!CheckCookie("msaV")){
                        SetCookie("msaV",1,1);
                        intro=introJs();
                        intro.onexit(function(){delete intro; intro=null});
                        intro.oncomplete(function(){intro.exit()});
                        //intro.start();
                    }*/
                })
          }
         
         
      }   
      msaCtrl.$inject=['$scope','$window','$timeout','GeograficService','SystemsFilters','$routeParams','SelectionService','$dialog','$location','$http'];
      
     function lifestylesCtrl($scope,$timeout,SystemsFilters,GeograficService,SelectionService,$routeParams,$location){
         $scope.$parent.status='';
         $scope.$parent.footerState='100%'; 
         $scope.lifestyles=angular.copy(SystemsFilters.lifestyles);
          $scope.relocaLife=angular.copy(SystemsFilters.relocaLife);
         $scope.travelLife=angular.copy(SystemsFilters.travelLife);
          
          $scope.msas=GeograficService.regions;
          $scope.nameFilter='';
          $scope.filteredList=[];
          $scope.lifestylesNameFilter='';
          $scope.filteredLifeStyles=[];
          $scope.systems=SystemsFilters.systemsHash;
          var idx=$routeParams.index||-1;
          $scope.idx=idx;
          if(idx<0 || !idx.toString().match(/\d+/))
              $location.path('/home');
          
          
          $scope.idx=idx*1;
          $scope.$parent.lfsidx=idx*1;
          if($scope.lifestyles.length)
              SelectionService.SelectLifeStyle($scope.lifestyles[idx].id);
          
         function calculateDimentions(){ 
                   var l=$scope.msas.length;
         var tw=Math.floor(10/l)*10;
         var m=(100-tw*l)/(l*2);
         if(m===0){
             m=1;
             tw-=2;
         }
         $scope.regionMargin=m+'%';
         $scope.regionWidth=tw+'%';
         }
          
          
          $scope.GetIdxById=function(id){
              for(var i=0;i<$scope.lifestyles.length;i++){
                  if($scope.lifestyles[i].id==id)
                    return i;
              }
              return -1;
          };
      
          $scope.SelectCity=function(midx,idx){
              $scope.msas[midx].SetActiveGroup(idx);
              $scope.msas[midx].groups[idx].SelectAll(true);
              SelectionService.SetArea($scope.msas[midx].groups[idx]);
              SelectionService.AddCities($scope.msas[midx].GetSelCities());
              $location.path('/nhbds/'+Date.now());
          };
      
          $scope.FilterLifeStyles=function(allowEmpty){
              $scope.lifestylesNameFilter=$scope.lifestylesNameFilter.replace(/^" "|" "?/g,'');
              $scope.filteredLifeStyles=[];
              if(!allowEmpty &&  !$scope.lifestylesNameFilter.length)
                  return;
              var reg;
              if($scope.lifestylesNameFilter.length)
                reg=new RegExp($scope.lifestylesNameFilter,'i');
              else
                  reg=new RegExp('.*','i');
              for(var i=0;i<$scope.lifestyles.length;i++){
                  
                  if($scope.lifestyles[i].name.match(reg))
                      $scope.filteredLifeStyles.push({id:$scope.lifestyles[i].id,name:$scope.lifestyles[i].name});
              }
          };
      
          $scope.ToggleShow=function($event){
              $event.preventDefault();
              $event.stopPropagation();
              $scope.showLifestyleList=!$scope.showLifestyleList;
          };
       
          $scope.$on('collapse',function(){
              $scope.showLifestyleList=false;
          });
          $scope.$on('reloadSystems',function(){
              $scope.systems=SystemsFilters.systemsHash;
          });
          
          $scope.$on('reloadLifestyles',function(){
              
                       $scope.lifestyles=angular.copy(SystemsFilters.lifestyles);
          $scope.relocaLife=angular.copy(SystemsFilters.relocaLife);
         $scope.travelLife=angular.copy(SystemsFilters.travelLife);
         
              SelectionService.SelectLifeStyle($scope.lifestyles[idx].id);
          });
          
          $scope.$on('regionsLoaded',function(){
              
              $scope.msas=GeograficService.regions;
              calculateDimentions();
              
          });
          
          $scope.$on('updateRegions',function(){
              
              $scope.msas=GeograficService.regions;
              calculateDimentions();
          });
          calculateDimentions();
      }
     lifestylesCtrl.$inject=['$scope','$timeout','SystemsFilters','GeograficService','SelectionService','$routeParams','$location'];
     
     function lifestylePulseCtrl($scope,$timeout,SystemsFilters,GeograficService,SelectionService,$routeParams,$location){
         var msa_idx=$routeParams.msa;
          var group_idx=$routeParams.group;
          var ls_idx=$routeParams.lifestyle;
          
          if(angular.isUndefined(msa_idx) || angular.isUndefined(group_idx))
              $location.path('/home');
          

         $scope.$parent.status='';
         $scope.$parent.footerState='100%'; 
         $scope.lifestyle=SystemsFilters.lifestyles[ls_idx];
          
          $scope.msa=GeograficService.regions[msa_idx];
          if($scope.msa && $scope.msa.groups)
          $scope.city=$scope.msa.groups[group_idx];
              $scope.systems=SystemsFilters.systemsHash;
          


          $scope.SelectCity=function(midx,idx){
              $scope.msas[midx].SetActiveGroup(idx);
              $scope.msas[midx].groups[idx].SelectAll(true);
              
              SelectionService.AddCities($scope.msas[midx].GetSelCities());
              $location.path('/nhbds/'+Date.now());
          };

          $scope.$on('reloadSystems',function(){
              $scope.systems=SystemsFilters.systemsHash;
              
          });
          
          $scope.$on('reloadLifestyles',function(){
              $scope.lifestyle=SystemsFilters.lifestyles[ls_idx];
          });
          
          $scope.$on('regionsLoaded',function(){
            $scope.msa=GeograficService.regions[msa_idx];
            $scope.city=msa.groups[group_idx];
              
          });
          
          $scope.$on('updateRegions',function(){
                $scope.msa=GeograficService.regions[msa_idx];
                $scope.city=msa.groups[group_idx];
          });
          
      }
     lifestylePulseCtrl.$inject=['$scope','$timeout','SystemsFilters','GeograficService','SelectionService','$routeParams','$location'];
     
     function nhbdCtrl($scope,$window,$timeout,SelectionService,SystemsFilters,CompareService,$rootScope,$routeParams,GeograficService,$location){
                 
         


         var search=$location.search();
         $scope.lf_id=+search.l;
         $scope.g=GeograficService;
         $scope.s=SelectionService;
         $scope.c=CompareService;
         $scope.msa= $scope.g.GetRegionById(search.m);

         $scope.area= $scope.g.GetRegionAreaById($scope.msa,search.c);
         

          
         if($scope.lf_id){
             $scope.s.SelectLifeStyle($scope.lf_id);
         }
         
         $scope.lifeStyle=angular.extend({},$scope.s.activeLifeStyle);
        
        
          var selectionWatcher;
          $scope.$parent.footerState='0%';
          $scope.expandedFooter=false;
          $scope.score_card=null;


          $scope.hotspotscore=-1;


          $scope.menu=SystemsFilters.groupingMenu;
          
          $scope.showHiddenMenu=false;

          $scope.GetNhbds=function(){
             $scope.hotspotscore=-1;
             $scope.$parent.status="Getting results";
             $scope.s.RequestPlaces(function(){
                  
                  $scope.spots=SelectionService.spots;
                  $timeout(function(){
                      if($scope.$parent)
                        $scope.$parent.status='';
                  },1000);
            });
          };


          $scope.$on('collapse',function($event,id){
                       if(id!==$scope.$id)
                           $scope.showHiddenMenu=false;

                       
         });
         

          
          $scope.toogleFooter=function(){
            $scope.expandedFooter=!$scope.expandedFooter;
            $scope.$parent.footerState=$scope.expandedFooter?'100%':'0%';
          }
          
          $scope.ToggleSystem=function($event,sys){
              
              $event.preventDefault();
              $event.stopImmediatePropagation();
              $event.stopPropagation();
                       
              $timeout.cancel(selectionWatcher);
              $scope.$parent.status="Updating Your Selection. Changes will be applyed when you are done";
              sys=$scope.lifeStyle.systems[sys.code]?$scope.lifeStyle.systems[sys.code]:sys;
              if(sys.active)
                  $scope.lifeStyle.systems[sys.code].active=SelectionService.RemoveSystem(sys.code, true);
              else{
                  if(! $scope.lifeStyle.systems[sys.code])
                       $scope.lifeStyle.systems[sys.code]=angular.extend({},sys)
                  $scope.lifeStyle.systems[sys.code].active=SelectionService.AddSystem(sys, true);
              }
              selectionWatcher=$timeout(function(){
                  SelectionService.UpdateQueryProxy(); 
                  $rootScope.$broadcast('selectedSystemsChanged');
              },2000);
              return $scope.lifeStyle.systems[sys.code].active;
          }
          


 
         $scope.ResetLifeStyle=function(){
             $scope.lifeStyle=angular.extend({},$scope.s.activeLifeStyle);
         }
         
         $scope.ToggleNhbd=function(nbhd,modif){
             if(!nbhd.compare){
                 nbhd.compare=true;
                $scope.c.Add2CompareWhileOff(nbhd);
                $scope.compares.push(nbhd);
             }
             else{
                 
                $scope.c.RemoveLocationById(nbhd.gid);

             }
         }
         
         $scope.CompareNhbd=function(num,nbhd){
             if(!nbhd)
                 return;
             CompareService.Add2CompareWhileOff(nbhd);
             nbhd.compare=true;
         }
         
         
         /*review*/
         $scope.ShowMenu=function($event,idx){
             $event.preventDefault();
                       $event.stopImmediatePropagation();
                       $event.stopPropagation();
             
             //$scope.lifeStyle.groups
             $scope.visible_menus.push($scope.hidden_menus.splice(idx,1)[0]);
         }
         /*review*/
         $scope.ToggleHiddenMenu=function($event){
             $event.preventDefault();
                       $event.stopImmediatePropagation();
                       $event.stopPropagation();
                       $scope.showHiddenMenu=!$scope.showHiddenMenu;
                       $rootScope.$broadcast('collapse',$scope.$id);
                  

         }
         
         

         

         
         $scope.RemoveGeography=function(){
             $location.search('c',null);
             $location.search('m',null);
             $scope.area=null;
             $scope.msa=null;
                     
         }
         $scope.UnselectLifeStyle=function(){
             $scope.s.UnselectLifeStyle();
             $scope.lifeStyle=null;
             $scope.lf_id=-1;
             $location.search('l',null)
         }
         
         /*review*/
         $scope.$on('lifestylesLoaded',function(){
             $scope.menu=$scope.sy.groupingMenu;
             CreateLfList();
             initMenus();
             if(!$scope.lifeStyle || !$scope.lifeStyle.id){
                $scope.s.SelectLifeStyle($scope.lf_id);
                $scope.lifeStyle=angular.extend({},$scope.s.activeLifeStyle);
            }
            $scope.$apply();
         });
         

         $scope.$on('systemsLoaded',function(){
             $scope.UpdateUrl($scope.s.map_query);
         });
         
         
         $scope.$on('compareAddFailed',function($event,id){
             var nbhd=GetNhbd(id);
             nbhd.compare=false;
             $timeout(function(){
                 var idx=$scope.compares.indexOf(nbhd);
                if(idx>=0)
                $scope.compares.splice(idx,1);
                $scope.$apply();
             });
             
         })
         
         
         $scope.$on('removedCompare',function($event,id){
             var nbhd=GetNhbd(id);
             nbhd.compare=false;
             $scope.compares.splice($scope.compares.indexOf(nbhd),1);
             //$scope.$apply();
         })
         

       /*review*/
       $scope.$on('hotSpotClicked',function($event,idx){
           $scope.hotspotscore=-1;
           $scope.score_card={
               hp:285000,
               education_level:"College Degree",
               average_age:38,
               walkability:"High",
               mass_transit:"Poor"
           };
           $scope.$apply();
           $timeout(
                   function(){
                        $scope.hotspotscore=idx;
                        $scope.$apply();
                   },
                   100
            )
       });
       
       /*review*/
       $scope.$on('selectedSystemsChanged',function(){
           if($scope.location)
            $scope.GetNhbds();
        });
        
        $scope.$on('updateSpots',function(){
            $scope.GetNhbds();
        }); 
    
        /*review*/
        $scope.$on('boundboxChanged',function($event,box){
            $scope.bbox=box;
        })
    
        /*review*/
        $scope.$on('searchChanged',function($event,terms){
            $scope.friendlySerch='';
            for(var i=0;i<terms.length;i++)
                $scope.friendlySerch+=terms[i].name+',';
            
            if($scope.friendlySerch.length)
                $scope.friendlySerch=$scope.friendlySerch.substr(0,$scope.friendlySerch.length-1);
        })

        $scope.$on('lifestylesUpdated',function($event,id){
            SelectLifeStyle(id,true);
        });
         

         
         
        /*get users location*/
        $scope.SetLocation=function(ltln){
            if (ltln && !ltln.PERMISSION_DENIED && !ltln.POSITION_UNAVAILABLE && !ltln.TIMEOUT) {
                ltln.coords=ltln.coords||{};
                ltln.coords.latitude=ltln.coords.latitude||ltln.lat;
                ltln.coords.longitude=ltln.coords.longitude||ltln.lng
                var lat = ltln.coords.latitude;
                var lng = ltln.coords.longitude;
                $scope.g.LocateArea(lng+","+lat, function(area){
                    if(!$scope.s.activeSearch)
                        $rootScope.$broadcast('takeAddress',area)
                    $timeout(function(){$scope.$apply();});
                });
            }
        }
    
        /*REVIEW*/
       $scope.$watch(function(){return JSON.stringify($location.search());},function(){
           var search=$location.search();
           var id=search.s;
           if(id==null)
               $scope.s.activeSearch=null;
           else if(!$scope.s.activeSearch || $scope.s.activeSearch!==id){
               $scope.s.FetchId(id).success(
                       function(data){
                          if(data.failure){
                              $location.search('s',null);
                              $scope.s.activeSearch=null;
                          }
                       }
                       )
           }
       
           $scope.$parent.coverAll=false;
           $scope.stage=((id!=null)*2)+1;
           if($scope.stage!==3)
               $scope.$parent.coverAll=Date.now();
           
           
       });
       
       
       
          
          /*review rewrite*/
         function GetNhbd(id){
              for(var i=0;i<$scope.spots.length;i++)
                  for(var j=0;j<$scope.spots[i].neighborhoods.length;j++)
                    if($scope.spots[i].neighborhoods[j].gid===id)
                      return $scope.spots[i].neighborhoods[j];
              return false;
        }

        function SelectLifeStyle(id,skip){
            /*if(id!=null && id>0)
            $scope.s.SelectLifeStyle(id,true);
            else
                $scope.s.UnselectLifeStyle();
            if(skip)*/
            $scope.lifeStyle=angular.extend({},SelectionService.activeLifeStyle);
        }
          
          /*review*/
        $scope.compares=[];
        $timeout(function(){
          if(!$rootScope.back)
                CompareService.Flush();
            else{
                var el=CompareService.GetElements();
                for(var i=0;i<el.length;i++){
                    $scope.compares.push(GetNhbd(el[i].obj.gid))
                }
            }  
            $scope.$apply();
        })
         

    }
     nhbdCtrl.$inject=['$scope','$window','$timeout','SelectionService','SystemsFilters','CompareService','$rootScope','$routeParams','GeograficService','$location'];
     
     function signupCtrl($scope,$timeout,$dialog){
         $scope.add2newsletter='';
         $scope.signupError='';
         $scope.state='right';
         var d;
         $scope.Submit=function(p_dialog){
             alert('Hola');
             return;
             if(!$scope.add2newsletter.length)
                 $scope.signupError='Please provide an email address';
             else if(!$scope.add2newsletter.match(/.+\@.+\..+/))
                 $scope.signupError='Please provide a valid email address';
             else{
                    var title = 'Thank you';
                    var msg = 'You have been submitted to our newsletter.';
                    var btns = [{result:'ok', label: 'Close', cssClass: 'btn-primary'}];

                    var d=$dialog.messageBox(title, msg, btns);
                    d.open();
                    if(p_dialog)
                        $scope.$parent.CloseDialog();
                    d.then(function(result){
                       
                       $scope.signupError='';
                       $scope.add2newsletter='';
                       d.close();
                    
                    });
             }
             $timeout(function(){
                 $scope.signupError='';
             },2000);
         };
         
         $scope.CloseDialog=function(result){dialog.close();};
         
         $scope.ToggleFields=function(){
             $scope.state=$scope.state=='down'?'right':'down';
         };
     }
     signupCtrl.$inject=['$scope','$timeout','$dialog'];

     function dialogCtrl($scope,dialog){
         $scope.CloseDialog=function(result){dialog.close(result)}
     }
     dialogCtrl.$inject=['$scope','dialog'];
      
     function profileCtrl($scope,$http,$timeout,$location){
         $scope.user=$scope.$parent.user;
         $scope.resetUrl='';
         if(!$scope.user|| !$scope.user.token || !$scope.user.token.length || !$scope.user.name || !$scope.user.name.length){
             
             $scope.$parent.AuthBoxToggle('login?srd=app/authsuccess&full=1');
             $window.history.back();
             return;
             
         }
         
         $http({method:'GET',url:'profile?t='+$scope.user.token})
         .success(function(data){
          if(data.success){
              delete data.success;
              $scope.vid=data.vid;
              for(var i in data)
                  $scope.user[i]=data[i];
              $timeout(function(){
                  $scope.resetUrl=$scope.$parent.authServer+'reset?vid='+data.vid
              })
              return;
            }
                $location.path('/home');
             //$window.history.back());
          
         }).error(function(){
                $location.path('/home');
         })
         
         
         $scope.authServer=$scope.$parent.authServer;
     }
     profileCtrl.$inject=['$scope','$http','$timeout','$location']

    function invitesCtrl($scope,$http){
         $scope.invites=[{name:'',email:'',error:false}];
         $scope.AddInvite=function(){
             $scope.invites.push({name:'',email:'',error:false});
         }
         
         $scope.RemoveInvite=function(index){
             $scope.invites.splice(index,1);
         }
         
         $scope.Submit=function(){
             for(var i=$scope.invites.length-1;i<=0;i){
                 if($scope.invites[i].error)
                     $scope.invites.splice(i,1);
             }
             
         }
     }
     invitesCtrl.$inject=['$scope','$http']
     
     function compareCtrl($scope,CompareService,$http,$timeout){
         $scope.nhbds=CompareService.GetElements();
         $scope.pending=[];
         $scope.pendingArgs=[];
         $scope.map_visible=true;
         $scope.$parent.footerState='100%';
         var l=$scope.nhbds.length;
         var tw=Math.floor(10/l)*10;
         var m=(100-tw*l)/(l*2);
         if(m===0){
             m=1;
             tw-=2;
         }
         $scope.fluidMargin=m+'%';
         $scope.fluidWidth=tw+'%';
         
         $scope.SaveCompare=function(){
             
         }
         
         $scope.SaveNhbd=function(obj){

             if(!$scope.$parent.CheckAuth('Save Neighborhoods is for registered users. Please log in or Register. Its Free and Fun')){
                $scope.pending.push(this);
                $scope.pendingArgs.push(obj);
                return;
             }
             var nhbd=$scope.nhbds[obj.idx]
             $http({method:'POST',url:'/savenhbd?nhbd='+nhbd.id}).success(function(data){
                 
             }).error(function(data){
                 if(data.status!=404){
                    $scope.$parent.logged=false;
                    $scope.$parent.user={};
                    $scope.SaveNhbd(obj);
                }
                
             })
             

         }
         
         $scope.PinNhbd=function(){
             
         }
         
         $scope.$on('authSuccess',function(){
             if($scope.processingQue)
                 return;
             $scope.processingQue=true;
                if($scope.pending.length && $scope.pendingArgs.length)
                do{
                        $scope.pending.pop()($scope.pendingArgs.pop());
                }while($scope.pending.length)
              $scope.processingQue=false;  
         })
         
         $scope.$on('authFailed',function(){
             if($scope.processingQue)
                 return;
             $scope.processingQue=true;
                if($scope.pending.length && $scope.pendingArgs.length)
                do{
                    $scope.pending.pop();
                    $scope.pendingArgs.pop()
                }while($scope.pending.length)
                $scope.processingQue=false;  
         });
         
         $timeout(function(){$scope.updateMap=Date.now();});
     }
     compareCtrl.$inject=['$scope','CompareService','$http','$timeout']
    
    
    
    
    
    
      
      
