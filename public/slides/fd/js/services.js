angular.module('LocalServices',[])
    .factory('SystemsFilters', ['$rootScope','$http',function($rootScope,$http) {
        var SystemsFilters = {};
        SystemsFilters.geoFilters=[];
        SystemsFilters.addons=[];
        SystemsFilters.filterSets=[];
        SystemsFilters.lifestyles=[];
        SystemsFilters.groupingMenu={};
        SystemsFilters.lifestylesCitypulses={};
        SystemsFilters.lifestylesGroups={};
        SystemsFilters.systemsHash={};
        SystemsFilters.systems={};
        SystemsFilters.systemsSets=[]
        var lfsloaded=false;
        var lfsgloaded=false;
        var systemsLoaded=false;
        var pulsesLoaded=false;
        
        
        
        
        
        function AddPulses2Lifestyle(){
            for(var i=0;i<SystemsFilters.lifestyles.length;i++){
                if(SystemsFilters.lifestylesCitypulses[SystemsFilters.lifestyles[i].id.toString()])
                SystemsFilters.lifestyles[i].pulses=SystemsFilters.lifestylesCitypulses[SystemsFilters.lifestyles[i].id.toString()].pulses;
            }
            $rootScope.$broadcast('reloadLifeStyles');
        }
       
       
        
        
        SystemsFilters.GetTree=function(f){
            $http({
                url:'api/menu',
                method:'get'
            }).success(function(tree){
                
                var lSystems={};
                tree.groups.sort(function(a,b){
                    return ((a.group_name.length<b.group_name.length)?1:-1);
                })
                for(var i=0;i<tree.groups.length;i++){
                    var g=tree.groups[i];
                    g.code=g.id||g.groupid;
                    g.id=g.code;
                    g.name=g.group_name;
                    delete g.groupid;
                    delete g.group_name;
                    g.children=[];
                    g.map={};
                    for(var j=0;j<g.subgroups.length;j++){
                        g.subgroups[j].subgroup.id=g.subgroups[j].subgroup.id||g.subgroups[j].subgroup.subgroupid;
                        lSystems[g.subgroups[j].subgroup.id]=g.subgroups[j].subgroup.subgroup_name;
                        
                        var sys={
                            code:g.subgroups[j].subgroup.id,
                            uid:g.subgroups[j].subgroup.id,
                            name:g.subgroups[j].subgroup.subgroup_name,
                            parent:g.id
                        }
                        g.map[sys.code]=sys;
                        g.children.push(sys);
                    }
                    g.children.sort(function(a,b){
                    return a.name.toLowerCase()>b.name.toLowerCase()?1:-1;
                })
                    delete g.subgroups;
                    
                }
                tree.groups.sort(function(a,b){
                    return a.name.toLowerCase()>b.name.toLowerCase()?1:-1;
                })
                SystemsFilters.relocaLife=[];
                SystemsFilters.travelLife=[];
                SystemsFilters.groupingMenu=angular.copy(tree.groups,[]);
                tree=tree.lifestyles;
                for(var i=0;i<tree.length;i++){
                    var ls=tree[i];
                    ls.idx=i;
                    ls.id=ls.id||ls.uid||ls.lifestyleid;
                    delete ls.uid;
                    delete ls.lifestyleid;
                    ls.name=ls.name||ls.mapname||ls.lifestyle_name;
                    delete ls.mapname;
                    delete ls.lifestyle_name;
                    var systems=angular.copy((ls.groups||ls.subgroups),[]); 
                    delete ls.subgroups;
                       
                    ls.systems={};
                    ls.groups={};
                    for(var j=0;j<systems.length;j++){
                        var sg=systems[j];


                        for(var k=0;k<SystemsFilters.groupingMenu.length;k++){
                            var g=SystemsFilters.groupingMenu[k];
                            if(g.map[sg] ){
                                ls.groups[g.id]=ls.groups[g.id]||{uid:g.id,code:g.code,name:g.name,systems:{},systemsArr:[],systems_count:0};
                                if(ls.groups[g.id].systems[sg])
                                    continue;
                                var sys=ls.groups[g.id].systems[sg]||{mapname:g.map[sg].name,code:g.map[sg].code,uid:g.map[sg].uid};
                                ls.groups[g.id].systems[sg]=sys;
                                ls.groups[g.id].systemsArr.push(sys);
                                ls.systems[sg]=ls.systems[sg]||{uid:g.map[sg].uid,mapname:g.map[sg].name,code:g.map[sg].code,active:true,parent:g.id};
                            }
                        }
                        
                        
     
                          /*ls.groups[g.code]={uid:g.uid, mapname:g.mapname, code:g.code};
                        for(var k=0;k<g.subsystems.length;k++){
                            g.systems[k]={mapname:lSystems[g.subsystems[k]],code:g.subsystems[k],uid:g.subsystems[k]};
                            ls.systems[g.systems[k].code]={uid:g.systems[k].uid,mapname:g.systems[k].mapname,code:g.systems[k].code,active:true};
                        }*/
                    }
                    ls.type='relocate';
                    if(ls.name.match(/travel/i)){
                        SystemsFilters.travelLife.push(ls);
                        ls.type='travel';
                    }
                    else
                        SystemsFilters.relocaLife.push(ls);
                }
                
                SystemsFilters.lifestyles=tree;
                if(!angular.isUndefined(f) && angular.isFunction(f))
                    f(tree);
            });

        }
     
   
       
        return SystemsFilters;
    }])
    .factory('SelectionService',['SystemsFilters','$http','$timeout','$rootScope',function(SystemsFilters,$http,$timeout,$rootScope) {
        var SelectionService = {};
        SelectionService.cities={};  
        SelectionService.area;  
        SelectionService.usedFilters=[];
        SelectionService.usedSystems=[]; 
        SelectionService.usedGroups={};
        SelectionService.filters=[];
        SelectionService.systems=[];        
        SelectionService.systemsSet=[];
        SelectionService.hp=[];
        SelectionService.activeLifeStyle={};
        SelectionService.query="";
         SelectionService.partial_query='';
          SelectionService.map_query='';
        SelectionService.lastQuery="";
        SelectionService.spots=[];
        SelectionService.priorities=[];
        SelectionService.prioritiesHash={};
        var activeRequest=0;
        
        SelectionService.Clear=function(){
                        for(var i=0;i<SelectionService.cities.length;i++)
                SelectionService.RemoveCity(SelectionService.cities[i]);
            if(SelectionService.activeLifeStyle && SelectionService.activeLifeStyle.id)
                SelectionService.UnselectLifeStyle(SelectionService.activeLifeStyle.id);
            
            for(var i=0;i<SelectionService.usedFilters.length;i++)
                SelectionService.RemoveFilter(SelectionService.usedFilters[i]);
            
            for(var i=0;i<SelectionService.usedSystems.length;i++)
                SelectionService.RemoveSystem(SelectionService.usedSystems[i]);
            

        }
        
        SelectionService.AddCity=function(city,skip){
            if(SelectionService.cities[city.id])
                return false;
            SelectionService.cities[city.id]=city;
            SelectionService.area=city.parent;
            if(!skip){
                //UpdateServer();
                $rootScope.$broadcast('citiesSelectionChanged');
            }
            
            return true;
        }
   
        SelectionService.SetArea=function(area){

            SelectionService.area=area;

        }
   
   
        SelectionService.AddCities=function(cities){
            SelectionService.cities={};  
            SelectionService.usedFilters=[];
            for(var i=0;i<cities.length;i++)
                SelectionService.AddCity(cities[i],true);
            
            //UpdateServer();
        }
   
        SelectionService.RemoveCity=function(id){

            delete SelectionService.cities[id];
            //UpdateServer();
            $rootScope.$broadcast('citiesSelectionChanged');
            return true;
        }
        
        SelectionService.SelectLifeStyle=function(id,skip){
            var lfs=GetLifeStyle(id);
            
            if(!SelectionService.activeLifeStyle)
                SelectionService.activeLifeStyle={};
            
            if( !angular.isUndefined(SelectionService.activeLifeStyle.id) && SelectionService.activeLifeStyle.id==id && !lfs.active)
                return false;
            
            var current_activelifestyle=GetLifeStyle(SelectionService.activeLifeStyle.id);
            if(current_activelifestyle)
                SelectionService.UnselectLifeStyle(SelectionService.activeLifeStyle.id)
            
            lfs.active=true;
            delete SelectionService.activeLifeStyle;
             SelectionService.activeLifeStyle=JSON.parse(JSON.stringify(lfs));
            if(SelectionService.activeLifeStyle.systems){
                for(var code in SelectionService.activeLifeStyle.systems){
                    if(!SelectionService.activeLifeStyle.systems[code].uid)
                        continue;
                     SelectionService.AddSystem(SelectionService.activeLifeStyle.systems[code],true,true);

                }
            }
            if(!skip){
                UpdateQuery();
                $rootScope.$broadcast('selectedSystemsChanged');
            }
            return SelectionService.activeLifeStyle;
        }

        SelectionService.UnselectLifeStyle=function(id){
            var lfs=GetLifeStyle(id);
            if(!lfs)
                return false;
            
            if(angular.isUndefined(SelectionService.activeLifeStyle.id) || SelectionService.activeLifeStyle.id!=id)
                return false;
            
            lfs.active=false;

            for(var code in SelectionService.activeLifeStyle.systems){
                 SelectionService.RemoveSystem(SelectionService.activeLifeStyle.systems[code].uid,true,true);
            }
            delete SelectionService.activeLifeStyle;
            SelectionService.activeLifeStyle={};
            return true;
        }
        
       SelectionService.AddSystem=function(sy,skipS,skipU){
           
           var g=SelectionService.activeLifeStyle.groups[sy.parent];
           if(!g){
                g={id:sy.parent,code:sy.parent,systemsArr:[],systems:[]};
                g.systems[sy.id]=sy;
                SelectionService.activeLifeStyle.groups[g.id]=g;
           }
           
            var s=SelectionService.activeLifeStyle.systems[sy.code];
            if(!s){
                s={uid:sy.uid,mapname:(sy.name||sy.mapname),name:(sy.name||sy.mapname),code:sy.code,parent:sy.parent};
                SelectionService.activeLifeStyle.systems[sy.code]=s;
                SelectionService.activeLifeStyle.groups[sy.parent].systems[sy.code]=s;
               
            }
            s.mapname=s.mapname||s.name;
            if(!s.active)
                SelectionService.activeLifeStyle.groups[sy.parent].systemsArr.push(sy);
            
            var idx=SelectionService.usedSystems.indexOf(s.uid);
            s.active=true;
            
            if(idx>=0)
                return false;
            SelectionService.usedSystems.push(s.uid);
            if(!skipS){
                UpdateQuery();
                $rootScope.$broadcast('selectedSystemsChanged');
            }
            return true;
        }

        SelectionService.RemoveSystem=function(code,skipS,skipU){
            var s=SelectionService.activeLifeStyle.systems[code];
            var arr=SelectionService.activeLifeStyle.groups[s.parent].systemsArr;
            if(!s)
                return false;
            var idx=-1;
            for(var i=0;i<arr.length;i++)
                if(arr[i].code===code)
                    idx=i;
            
            if(idx>=0)
                arr.splice(idx,1);
            
            var idx=SelectionService.usedSystems.indexOf(s.uid);
            s.active=false;
            if(idx<0)
                return false;
            SelectionService.usedSystems.splice(idx,1);
            var idx1=SelectionService.priorities.indexOf(s.code);
            if(idx1>=0)
            SelectionService.priorities.splice(idx1,1);
            if(!skipS){
                UpdateQuery();
            $rootScope.$broadcast('selectedSystemsChanged');
            }
            return false;
        }
        
        SelectionService.TogglePriority=function(sys){
            var idx=SelectionService.priorities.indexOf(sys.code);
            var message='';
            time=2500;
            if(idx<0){
                if(SelectionService.priorities.length===((6/4)*2))
                    return true;
                    if(!sys.active)
                 SelectionService.AddSystem(sys,true);
                if(SelectionService.priorities.length===((6/4)*2)){
                    
                    time+=1500;
                    var sys1=GetSystem(SelectionService.priorities.shift());
                    message='"'+sys1.name+'" is no longer a priority and ';
                }
                
                message+='"'+sys.name+'" will be prioritized';
                SelectionService.priorities.push(sys.code);
                
            }
            else{
                message='"'+sys.name+'" is no longer a priority';
                SelectionService.priorities.splice(idx,1);
            }
            $rootScope.$$childHead.status=message;
            $timeout.cancel($rootScope.$$childHead.statusTimer);
            $rootScope.$$childHead.statusTimer=$timeout(function(){
                $rootScope.$$childHead.status='';
                $rootScope.$$childHead.$apply();
            },time);
            
            
            UpdateQuery();
            $rootScope.$broadcast('selectedSystemsChanged');
            return SelectionService.priorities.length===((6/4)*2);
        };
        
        SelectionService.isPriority=function(id){
            return SelectionService.priorities.indexOf(id)>=0;
        };
        

        
        
        function UpdateQuery(){
                        SelectionService.map_query='';
           
           var cities='';
           var join='&gid=';
           for(var i in SelectionService.cities){
               cities+=join+'i';
               join='';
           }
            cities=cities.substr(0,cities.length-1);

           
           SelectionService.usedSystems=SelectionService.usedSystems.sort(function(a,b){
               var res=a-b;
               res=(res===0?0:(res/Math.abs(res)));
               return res;
           });
           
           SelectionService.priorities=SelectionService.priorities.sort(function(a,b){
               var res=a-b;
               res=(res===0?0:(res/Math.abs(res)));
               return res;
           });
           
           SelectionService.map_query+=(SelectionService.area?('area='+SelectionService.area.id+'&'):'')+(SelectionService.activeLifeStyle.id?('lifestyle='+SelectionService.activeLifeStyle.id+'&'):'')+(SelectionService.usedSystems.length?('subgroup='+SelectionService.usedSystems.join(',')+'&'):'')+(SelectionService.priorities.length?('pri='+SelectionService.priorities.join(',')+'&'):'');//+'&gid='+SelectionService.cities.join(',');
           //SelectionService.map_query=SelectionService.map_query.substr(0,SelectionService.map_query-1);
           SelectionService.query=SelectionService.map_query+cities;

           $rootScope.$broadcast('updateQuery');
           return SelectionService.map_query;
        }
        
        function UpdateServer(){
            UpdateQuery();
            d3.tsv('pulse.tsv?'+SelectionService.query,function(data){
            ClearNhbds();
            activeRequest++;
                for(var i=0;i<data.length;i++){
                    data[i].id=data[i].id||data[i].gid;
                    delete data[i].gid;
                    data[i].id*=1;
                    data[i].systems=data[i].systems.split(',');

                    SelectionService.nhbds.push(data[i]);
                    if(data[i].pinned)
                        SelectionService.pNhbds.push(data[i].id);
                    
                   if(data[i].compare)
                        CompareService.add(data[i]);
                    
                    var call=(function(){
                        var lActiveCall=activeRequest;
                        return function(){
                            $http('zones/'+data[i].id+'.json',function(data){
                                if(lActiveCall!==activeRequest)
                                    return;
                                $rootScope.broadcast('receivedNeighborhood',data);
                            });
                        }
                    }())
                    call();
                }
              if(angular.isFunction(fn))
                 fn(SelectionService.nhbds);
             
             $rootScope.broadcast('receivedPlaces');
             
             
                    
            });
            
            

           
        }

    
        function GetLifeStyle(id){
            if (!SelectionService.lifestyles)
                return false;
            for(var i=0;i<SelectionService.lifestyles.length;i++){
                if(SelectionService.lifestyles[i].id===id)
                    return SelectionService.lifestyles[i];
            }
            return false;
        }

        function GetSystem(code){
            for(var i in SelectionService.activeLifeStyle.systems){
                  if(SelectionService.activeLifeStyle.systems[code])
                        return SelectionService.activeLifeStyle.systems[code];
            }
            return false;
        }

        function ClearNhbds(){
            for(var i=SelectionService.nhbds.length-1;i>=0;i--){
                //if(!SelectionService.nhbds[i].pinNed && !SelectionService.nhbds[i].compare)
                    SelectionService.nhbds.splice(i,1);
            }
            
        }

        function IsSystemSelected(obj){
            if(!obj.systems || !obj.systems.length)
                return false;
            
            var selected=true;
            for(var i=0;i<obj.systems.length;i++){
                selected=selected && (SelectionService.usedSystems.indexOf(obj.systems[i])>=0)
                if(!selected)
                    break;
            }

            return selected;
        }
        

        
        /*function CheckActiveLifeStyle(){
            if(!SelectionService.activeLifeStyle || angular.isUndefined(SelectionService.activeLifeStyle.id))
                return false;
            
            SelectionService.activeLifeStyle.active=IsSystemSelected(SelectionService.activeLifeStyle);
            return SelectionService.activeLifeStyle.active
        }*/

        
        SelectionService.RequestPlaces=function(fn){
            UpdateQuery();
            if( SelectionService.lastQuery===SelectionService.query && SelectionService.spots.length){
                if(angular.isFunction(fn))
                    fn(SelectionService.spots);
                 $rootScope.$broadcast("PlacesReceived",SelectionService.spots)
                return;
            }
            SelectionService.lastQuery=SelectionService.query;
            
            $http({
                url:'api/places?'+SelectionService.query,
                method:'get'
            }).success(function(data){
                var spots=data.hotspots;
                SelectionService.spots=spots;
               
                
               if(angular.isFunction(fn))
                 fn(SelectionService.spots);
              $rootScope.$broadcast("PlacesReceived",SelectionService.spots)
            });
            
            
            /*d3.tsv('/pulse.tsv?'+SelectionService.query,function(data){
            ClearNhbds();
            activeRequest++;
                if(!data || !data.length)
                    return;
                for(var i=0;i<data.length;i++){
                    data[i].id=data[i].id||data[i].gid;
                    delete data[i].gid;
                    data[i].id*=1;
                    data[i].systems=data[i].systems.split(',');

                    SelectionService.nhbds.push(data[i]);
                    if(data[i].pinned)
                        SelectionService.pNhbds.push(data[i].id);
                    
                   if(data[i].compare)
                        CompareService.add(data[i]);
                    
                    var call=(function(){
                        var lActiveCall=activeRequest;
                        return function(){
                            $http({
                                method:'GET',
                                url:'/zones/'+data[i].id+'.json'
                            }).success(function(data){
                                if(lActiveCall!==activeRequest)
                                    return;
                                $rootScope.broadcast('receivedNeighborhood',data);
                            });
                        };
                    }());
                    call();
                }
              if(angular.isFunction(fn))
                 fn(SelectionService.nhbds);
             
             $rootScope.broadcast('receivedNeighborhoodsList');
             
             
                    
            });*/
        }


       
       $rootScope.$on('lifestylesLoaded',function(){
                SelectionService.lifestyles=SystemsFilters.lifestyles;
                //SelectionService.SelectLifeStyle(SystemsFilters.lifestyles[0].id);
               //$rootScope.$apply();
       })
       
        SelectionService.UpdateQueryProxy=UpdateQuery;
       
        return SelectionService;
    }])
    
   