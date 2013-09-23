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
        SelectionService.lastQuery="";
        SelectionService.spots=[];
        SelectionService.priorities=[];
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
        
        SelectionService.SelectLifeStyle=function(id){
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
                s={uid:sy.uid,mapname:sy.name,name:sy.name,code:sy.code,parent:sy.parent};
                SelectionService.activeLifeStyle.systems[sy.code]=s;
                SelectionService.activeLifeStyle.groups[sy.parent].systems[sy.code]=s;
               
            }
            
            if(!s.active)
                SelectionService.activeLifeStyle.groups[sy.parent].systemsArr.push(sy);
            
            var idx=SelectionService.usedSystems.indexOf(s.uid);
            s.active=true;
            
            if(idx>=0)
                return false;
            SelectionService.usedSystems.push(s.uid);
            if(!skipS)
                UpdateQuery();
            
            
            $rootScope.$broadcast('selectedSystemsChanged');
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
            idx=SelectionService.priorities.indexOf(s.code);
            SelectionService.priorities.splice(idx,1);
            if(!skipS)
                UpdateQuery();
            $rootScope.$broadcast('selectedSystemsChanged');
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
           

           
           SelectionService.map_query+='area='+SelectionService.area.id+'&lifestyle='+SelectionService.activeLifeStyle.id+'&subgroups=['+SelectionService.usedSystems.join(',')+(SelectionService.priorities.length?(']&pri=['+SelectionService.priorities.join(',')+']'):'');//+'&gid='+SelectionService.cities.join(',');
           SelectionService.query=SelectionService.query+cities;

           $rootScope.$broadcast('updateQuery');
           return SelectionService.partial_query;
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
                SelectionService.SelectLifeStyle(SystemsFilters.lifestyles[0].id);
               //$rootScope.$apply();
       })
       

       
        return SelectionService;
    }])
    .factory('GeograficService',['$rootScope','SelectionService','SystemsFilters','$timeout',function($rootScope,SelectionService,SystemsFilters,$timeout){////////////////////////SERVICE USED MOSTLY IN HOME //////////////////
        var GeograficService = {};
        GeograficService.regions=[];
        GeograficService.activeRegion=null;
        GeograficService.SelectRegion=function(idx){
            GeograficService.activeRegion=GeograficService.regions[idx];
            $rootScope.$broadcast('regionSelected');
            return  GeograficService.activeRegion;
        }
        GeograficService.GetRegions=function(f){
            d3.json('api/region',function(data){
                if(data.results)
                    data=data.results;
                for(var i=0;i<data.length;i++){
                    data[i].idx=i;
                    data[i].id=data[i].regionid || data[i].gid;
                    delete data[i].regionid;
                    delete data[i].gid;
                   GeograficService.regions.push(new Region(data[i])) ;
                   if(data[i].areas && data[i].areas.length){
                       for(var j=0;j<data[i].areas.length;j++){
                           data[i].areas[j].id=data[i].areas[j].areaid||data[i].areas[j].gid;
                           data[i].areas[j].idx=j;
                           delete data[i].areas[j].areaid;
                           delete data[i].areas[j].gid;
                           var gobj=new Group(data[i].areas[j]);
                            if(data[i].areas[j].cities && data[i].areas[j].cities.length){
                                data[i].areas[j].cities.sort(function(a,b){return a.name>b.name?1:-1;});
                                for(var k=0;k<data[i].areas[j].cities.length;k++){
                                    data[i].areas[j].cities[k].id=data[i].areas[j].cities[k].id || data[i].areas[j].cities[k].cityid || data[i].areas[j].cities[k].gid;
                                    delete data[i].areas[j].cities[k].cityid;
                                    delete data[i].areas[j].cities[k].gid;
                                    var val1=(Math.random()*1000000),
                                        val2=(Math.random()*1000000);
                                     data[i].areas[j].cities[k].hp=[data[i].areas[j].cities[k].lo_price,data[i].areas[j].cities[k].hi_price];//data[i].areas[j].cities[k]['price-range'];
                                    delete data[i].areas[j].cities[k].lo_price;
                                    delete data[i].areas[j].cities[k].hi_price;
                                    
                                    var cobj=new City(data[i].areas[j].cities[k]);
                                    gobj.AddCity(cobj);
                                }
                            }
                           GeograficService.regions[i].AddGroup(gobj); 
                       }
                   }
                       
                }
               
              if(!angular.isUndefined (f) && angular.isFunction(f))
                f(data)
            });
        }
        
        $rootScope.$on('filtersLoaded',function(){
            for(var i=0;i<GeograficService.regions.length;i++)
                GeograficService.regions[i].updateFilters();
                $rootScope.$broadcast('updateRegions');
            })
        

        
        function City(a){
            for(var i in a){
                if(!angular.isUndefined(a[i]) && !angular.isFunction(a[i]) && !angular.isArray(a[i]) && !angular.isObject(a[i]))
                    this[i]=a[i]
                else if(angular.isArray(a[i])){
                    this[i]=[];
                    this[i]=angular.copy(a[i],this[i]);
                }
            }
            
            this.filterTag=this.name+((this.zipcodes && this.zipcodes.length)?'-'+this.zipcodes.join('-'):'');
            this.selected=false;
            return this;
        }
        
        City.prototype.ToggleSelect=function(state,skipEvent,skipCheck){
            
            //this.selected=!this.selected;
            if(state || (angular.isUndefined(state) &&  this.selected)){
                //SelectionService.AddCity(this.id)
            }
            else if(this.selected || (angular.isUndefined(state) &&  !this.selected)){
                //SelectionService.RemoveCity(this.id)
            }
            if(!angular.isUndefined(state))
                this.selected=state;
            
            
            
            if(!skipEvent)
                $rootScope.$broadcast('cityStatusToggled',this);
            if(skipCheck)
                return;
           this.parent.CheckSelectedAll(this.selected);
           
        }
        
        City.prototype.ReqNhdbs=function(f){
            var obj=this;
            d3.tsv('meighborhoods/'+obj.id,function(data){
                for(var i=0;i<data.length;i++){
                    data[i].nhdb_idx=i;
                    data[i].selected=false;
                    data[i].show=true;
                    obj.nhbds=new Neighborhood(data[i]);
                    obj.nhbds[obj.nhbds.length-1].parent=this;
                }
                
                if(angular.isFunction(f))
                    f(data)
            })
        }
        
        City.prototype.AddNhdbs=function(nhbds){
            if(angular.isUndefined(this.nhdbs))
                this.nhdbs=[];
            this.nhdbs=angular.copy(nhbds,this.nhdbs);
        }

        City.prototype.GetNhdbs=function(){
                    return this.nhdbs;
       }
       
        City.prototype.GetNhdbById=function(nid){
           for(var i=0;i<this.nhdbs.length;i++){
                if(this.nhdbs[i].id==nid)
                    return this.nhdbs[i];
            }
            return false;
        }
        
        City.prototype.GetNhdbByIdx=function(nidx){
           if(this.nhbds.length>nidx)
               return this.nhbds[nidx];
           return false
        }
        
        
        
        function Group(a){
            for(var i in a){
                if(!angular.isUndefined(a[i]) && !angular.isFunction(a[i]) && !angular.isArray(a[i]) && !angular.isObject(a[i]))
                    this[i]=a[i]
            }
            this.category="temp city";
            this.allSelected=false;
            this.cities=[];
            this.hpmax=0
            this.hpmin=1000000000000;
        }
        
        Group.prototype.GetSelCities=function(){
            var selcities=[];

            for(var i=0; i<this.cities.length;i++){
                if(this.cities[i].selected){
                    selcities.push(this.cities[i]);
                }
            }
            return selcities;
        }
        
        Group.prototype.AddCity=function(obj){
            if(this.GetCityById(obj.id))
                return false;
            obj.parent=this;
            this.hpmin=Math.min(this.hpmin,obj.hp[0]*1);
            this.hpmax=Math.max(this.hpmax,obj.hp[1]*1);
            this.hp=[this.hpmin,this.hpmax];
            this.cities.push(obj);
            return true;
            
        }
        
        Group.prototype.GetCityById=function(cid){
            for(var i=0;i<this.cities.length;i++){
                if(this.cities[i].id==cid)
                    return this.cities[i];
            }
            return false;
        }
        
        Group.prototype.GetCityByIdx=function(cidx){
            if(cidx<this.cities.length && cidx>=0)
                    return this.cities[i];
            
            return false;
        }
        
        Group.prototype.SelectAll=function(skipCheck){
            this.allSelected=true;
            for(var i=0;i<this.cities.length;i++)
                this.cities[i].ToggleSelect(true,null,true);
            
            if(!skipCheck)
                this.parent.CheckSelectedAll(true);
            
        }
        
        Group.prototype.UnselectAll=function(skipCheck){
            for(var i=0;i<this.cities.length;i++)
                this.cities[i].ToggleSelect(false,null,true);
            this.allSelected=false;
            if(!skipCheck)
            this.parent.CheckSelectedAll(false);
        }
        
        Group.prototype.ToggleAll=function(){
            
            for(var i=0;i<this.cities.length;i++)
                this.cities[i].ToggleSelect(!this.cities[i].selected,null,true);
            this.parent.CheckSelectedAll(true);
        }
        
        Group.prototype.ToggleAllSelected=function(){
            
            for(var i=0;i<this.cities.length;i++)
                this.cities[i].ToggleSelect(!this.allSelected,null,true);
            this.allSelected=!this.allSelected;
            this.parent.CheckSelectedAll(this.allSelected);
        }
        
        Group.prototype.CheckSelectedAll=function(status,skipParent){
            
            this.allSelected=status;
            
            if(!status){
                this.parent.CheckSelectedAll(false);
                return false;
            }
            
            
            for(var i=0;i<this.cities.length;i++)
                this.allSelected = this.allSelected && this.cities[i].selected;
            if(!skipParent)
                this.parent.CheckSelectedAll(this.allSelected);
            
            return this.allSelected;
        }
        
        
        function Region(a){
            for(var i in a){
                if(!angular.isUndefined(a[i]) && !angular.isFunction(a[i]) && !angular.isArray(a[i]) && !angular.isObject(a[i]))
                    this[i]=a[i]
            }
            this.selectAll=false;
            this.checkAll=false;
            this.hp=[10000000000000,0];
            this.msaHP=[10000000000000,0];
            this.activeGroup=0;
            this.filteredCities=[];
            this.filter_selection={
            system_based:[],
           hp:[10000000000000,0],
           hp_disabled:false,
            name_zip:''
            };
            this.active=false;
            this.groups=[];
            this.filters=[];
            this.hpPercent=100;
            this.hpMargin=0;
            var self=this;
 
             if(SystemsFilters.geoFilters.length){
               this.updateFilters();
            }
        }
        
        Region.prototype.GetSelCities=function(){
            return this.groups[this.activeGroup].GetSelCities();
        }
        
        Region.prototype.GetFriendlyAreasList=function(){
                var areas_names='';
                for(var i=0;i<this.groups.length;i++){
                    areas_names+=this.groups[i].name+(i==this.groups.length-2?' and ':(i==this.groups.length-1?'':', '));
                }
                return areas_names;
       }
        
        Region.prototype.SetActiveGroup=function(idx,cid){
            if(!this.groups[this.activeGroup] || !this.groups[idx])
                return;
            //this.groups[this.activeGroup].UnselectAll();
            this.activeGroup=idx;
            if(cid){
                var self=this;
                //$timeout(function(){
                    self.groups[self.activeGroup].GetCityById(cid).ToggleSelect(true);
                    this.filteredCities=[];
                    this.filter_selection.name_zip='';
                    //this.selectAll=false;
                //})
            }
            this.filter_selection.hp=this.groups[idx].hp;
            this.hp=this.groups[idx].hp;
            this.hpPercent=(this.hp[1]-this.hp[0])*100/(this.msaHP[1]-this.msaHP[0]);
            this.hpMargin=(this.hp[0])*100/(this.msaHP[1]-this.msaHP[0]);
            this.CheckSelectedAll(true);
        }
        
        Region.prototype.ToggleChecktAll=function(){
             if(this.checkAll)
                 this.groups[this.activeGroup].SelectAll();
             else
                this.groups[this.activeGroup].UnselectAll();
         }
        
        Region.prototype.updateFilters=function (){
                this.filters=angular.copy(SystemsFilters.geoFilters,this.filters)
            }
        
        Region.prototype.ToggleFilter=function(fId){
            fId*=1;
            var idx=this.filter_selection.system_based.indexOf(fId);
            if(idx>=0)
               this.filter_selection.system_based.splice(idx,1) ;
           else
              this.filter_selection.system_based.push(fId);
           
           this.ApplyFilters();
        }
        
        Region.prototype.AddGroup=function(obj){
            obj.parent=this;
            
            this.filter_selection.hp[0]=Math.min(this.filter_selection.hp[0], obj.hpmin);
            this.filter_selection.hp[1]=Math.max(this.filter_selection.hp[1], obj.hpmax);
            
            this.hp[0]=this.filter_selection.hp[0];
            this.hp[1]=this.filter_selection.hp[1];
            this.hp[0]-=0.0000000001;
            this.hp[1]+=0.0000001;
            this.msaHP[0]=this.hp[0];
            this.msaHP[1]=this.hp[1];
            this.groups.push(obj);
        }
        
        Region.prototype.SelectAll=function(){
            for(var i=0;i<this.groups.length;i++)
                this.groups[i].SelectAll(true);
            
            this.selectAll=true;
            
        }
        
        Region.prototype.UnselectAll=function(){
            for(var i=0;i<this.groups.length;i++)
                this.groups[i].UnselectAll(true);
            this.checkAll=false;
            
        }

        
        Region.prototype.ToggleAll=function(){
            for(var i=0;i<this.groups.length;i++)
                this.groups[i].ToggleAll();
        }
        
        Region.prototype.ApplyFilters=function(){
            return;
            if(!this.filter_selection.system_based.length && !$.trim(this.filter_selection.name_zip).length && this.filter_selection.hp_disabled){
                //return;
                for(var i=0;i<this.groups.length;i++){
                    var g=this.groups[i];
                    for(var j=0;j<g.cities.length;j++){
                        var city=g.cities[j];
                        if(city.selected!==false)
                             city.ToggleSelect(false);
                    }
                }
                return;
            }
            
            for(var i=0;i<this.groups.length;i++){
                var g=this.groups[i];
                for(var j=0;j<g.cities.length;j++){
                    var city=g.cities[j];
                    if(!city.filterTag.match(this.filter_selection.name_zip) /*&& !this.selectAll*/){
                        if(city.selected)
                            city.ToggleSelect(false/*||this.selectAll*/);
                        continue;
                    }
                    
                    var comply=((city.hp[0]*1<=this.filter_selection.hp[1]*1) && (city.hp[1]*1>=this.filter_selection.hp[0]*1))|| this.filter_selection.hp_disabled;
                    for(var k=0;k<this.filter_selection.system_based.length;k++){
                        comply=comply && (city.filters.indexOf(this.filter_selection.system_based[k])>=0);
                        if(!comply)
                            break;
                    }
                    comply=comply||this.selectAll;
                    if(city.selected!=comply)
                        city.ToggleSelect(comply);
                        
                }
            }
        }
        
        Region.prototype.GetCityById=function(cid){
            for(var i=0;i<this.groups.length;i++)
                for(var j=0;j<this.groups[i].cities.length;j++)
                    if(this.groups[i].cities[j].id*1==cid*1)
                        return this.groups[i].cities[j];
           return false;  
        }
        
        Region.prototype.CheckSelectedAll=function(status){
            this.checkAll=status;

                
               
            if(!status){
              $timeout(function(){$rootScope.$apply();});
                return;
            }
            //for(var i=0;i<this.groups.length;i++)
                this.checkAll=this.checkAll && this.groups[this.activeGroup].allSelected;
             
        }
        
        Region.prototype.DeepCheckAll=function(){
            this.selectAll=true;
            for(var i=0;i< this.groups.length;i++)
                this.selectAll=this.selectAll && this.groups[i].CheckSelectedAll(true,true);
            
            this.checkAll=this.selectAll;
        }
        
        Region.prototype.UpdateCitiesSelection=function(){
            this.filteredCities=[];
            if(!this.filter_selection.name_zip.length)
                return;
            var reg=new RegExp(this.filter_selection.name_zip,'i');
            for(var i=0;i<this.groups.length;i++){
                for(var j=0;j<this.groups[i].cities.length;j++){
                    
                    if(this.groups[i].cities[j].filterTag.match(reg))
                        this.filteredCities.push({name:(this.groups[i].cities[j].name+', '+this.groups[i].name),group:i,id:this.groups[i].cities[j].id});
                }
            }
        }
        
        return GeograficService;
    }])
    .factory('CompareService',['$rootScope','$timeout','$dialog',function($rootScope,$timeout,$dialog) {
        var CompareService = {};
        var elements=CompareService.elements=[
              {editmode:false},
              {editMode:false},
              {editMode:false},
              {editMode:false},
          ];
          
        CompareService.Add2CompareWhileOn=function(obj,idx){
            if(idx>3)
                return;
            elements[idx].obj=new Element(obj);
            $rootScope.$broadcast('addedCompare',idx,obj.id);
        }
          
        CompareService.Add2CompareWhileOff=function(obj){
            var i=0
            for(i=0; i< elements.length;i++){
                if(!elements[i].obj)
                break;
            }
        
            if(i>3){
                $dialog.messageBox('Notice','you can only compare up to 4 locations at once.',[{label:'close',result:'no'}]).open();
                $rootScope.$broadcast('compareAddFailed',obj.id||obj.gid);
                return false;
            }
        
            CompareService.Add2CompareWhileOn(obj,i)
                return i;
            }   
          
           CompareService.Flush=function(){
               for(var i=0;i<CompareService.elements.length;i++){
                   CompareService.RemoveLocationByIdx(i);
               }
           }
          
            CompareService.RemoveLocation=function(obj){
                CompareService.RemoveLocationById(obj.id);
            }
            
            CompareService.RemoveLocationById=function(id){
                for(var i=0;i<elements.length;i++)
                    if(elements[i].obj && elements[i].obj.gid==id){
                        CompareService.RemoveLocationByIdx(i);
                        return;
                    }
            }
            
            CompareService.RemoveLocationByIdx=function(idx){
                if(!elements[idx].obj)
                    return;
                if(idx<0 || idx>3){
                    console.log('error removing from compare');
                    return;
                }
                var id=elements[idx].obj.gid;    
                elements[idx].editMode=false;
                delete elements[idx].obj;
                $rootScope.$broadcast('removedCompare',id);
            }
           
           CompareService.GetElements=function(){
               var arr=[];
               for(var i=0;i<elements.length;i++){
                   if(elements[i].obj)
                       arr.push(elements[i]);
               }
               return arr;
           }
           function Element(a){
            for(var i in a){
                if(!angular.isUndefined(a[i]) && !angular.isFunction(a[i]) && !angular.isArray(a[i]) && !angular.isObject(a[i]))
                    this[i]=a[i];
                else if(angular.isArray(a[i])){
                    this[i]=[];
                    this[i]=angular.copy(a[i],this[i]);
                }
                else if(angular.isObject(a[i])){
                    this[i]={}
                    this[i]=angular.extend(a[i],this[i]);
                }
            }
            this.GetDetails();
        }
        
        Element.prototype.Get=function(){
            return this;
        }
        
        Element.prototype.Share=function(){
            
        }
        
        Element.prototype.GetDetails=function(f){
            var _self=this;
            d3.tsv('nhbd_details?'+this.id, function(data) {

                delete data[0].id;
                delete data[0].Name;
                for(var i in data[0]){
                    var il=i.toString().toLowerCase();
                      _self[il]=data[0][i]
                }
                if(angular.isFunction(f))
                    f(data);
                $rootScope.$apply();
        }).on('error',function(data){
            if(data.code!=404 && data.responseText.length)
                alert(data.responseText)
               
            console.log('error adding');
            $rootScope.$broadcast('compareAddFailed',_self.id);
            CompareService.RemoveLocation(_self);
        })

        }


  return CompareService;
}])
    
   