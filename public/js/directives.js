angular.module('Directives',['LocalServices'/*,'MapModule'*/])
    .directive('slider',function(){
        return{
            restrict:'AC',
            link:function(scope,element,attrs){
                var min=angular.isUndefined(attrs.min)?-10:attrs.min;
                var max=angular.isUndefined(attrs.max)?10:attrs.max;
                var value=angular.isUndefined(attrs.value)?1:attrs.value;
                var step=angular.isUndefined(attrs.step)?1:attrs.step;
                var range=+attrs.range;
                min*=1;
                max*=1;
                step*=1;
                value*=1;
                var conf={
                 min:min,
                 max:max,
                 step:step,
                 range:range,
                 slide:function(event,ui){
                     var val=range?ui.values:ui.value;
                     if(range){
                         if((+val[1]-+val[0])<range){
                             if(ui.value<ui.values[1])
                                val[0]=(+ui.values[1]-range)
                             else
                                val[1]=(+ui.values[0]+range)
                            
                             $(this).slider('options','values',val);

                         }
                     }
                     scope.$emit('slider_change',val);
                 },
                change:function(event,ui){
                     var val=range?ui.values:ui.value;
                     scope.$emit('slider_change',val);
                 }

                };
                if(range){
                    
                    var minval=!angular.isUndefined(attrs.minval)?attrs.minval:min;
                    var maxval=!angular.isUndefined(attrs.maxval)?attrs.maxval:max
                    
                    conf.values=[minval*1,maxval*1]
                }
                else
                    conf.value=value;
                element.slider(
                  conf  
                );
                
                scope.$watch(function(){return attrs.update;},function(){
                    var min=(angular.isUndefined(attrs.min)?-10:attrs.min)*1;
                    var max=(angular.isUndefined(attrs.max)?10:attrs.max)*1;
                    var value=angular.isUndefined(attrs.value)?1:attrs.value;
                    var minval=(!angular.isUndefined(attrs.minval)?attrs.minval:min)*1;
                    var maxval=(!angular.isUndefined(attrs.maxval)?attrs.maxval:max)*1;
                    element.slider('option','min',min);
                    element.slider('option','max',max);
                    if(range)
                        element.slider('option','values',[minval,maxval]);
                    else
                       element.slider('option','value',value); 
                })
            }
        }
    })
    .directive('vectorMap',['$timeout','$rootScope','$http',function($timeout,$rootScope,$http){
        return{
            restrict:'C',
            replace:false,
            template:'<div style="width:100%; height:100%" id="map"></div>\
            <div class="map-status-report reported_true" ng-show="mapStatus.length>0" style="z-index:7001">\
                <img src="public/images/loading.gif" style="margin-right:0.5em; width:2em;"><span id="map_status_message">{/{mapStatus}/}</span>\
            </div>',
            link:function(scope,element,attrs){
                var map,projObject,layer,infoPop;
                var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
                var googleProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
                //var usProjection   = new OpenLayers.Projection("EPSG:U4M"); // to
                var data={type:"FeatureCollection", features:[]};
                var citiesFt=[], cityCenterLayer,citiesLayer,markersLayer,cityMarker;
                var highlightCtrl,selectCtrl,transfCtrl=null;
                var self=this;
                
                var select = function(e,skipapply) {
                        if(!e.layer)
                            return;
                        if(e.attributes.scaled){
                            e.attributes.zIndex=1;
                            e.attributes.scaled=false;
                        }
                         
                         var city=scope.SelectCityById(e.attributes.id,true);
                         if(infoPop)
                             map.removePopup(infoPop);
                         
                         if(scope.hoveredCity>01){
                             if(e.geometry.bounds.centerLonLat){
                                infoPop=new OpenLayers.Popup.Anchored("city_detail",
                                e.geometry.bounds.centerLonLat,
                                new OpenLayers.Size(200,200),
                                "example popup",null,
                                true);
                                infoPop.panMapIfOutOfView=false;
                                //infoPop.keepInMap=true;
                                map.addPopup(infoPop);
                            }
                         }
                         scope.hoveredCity=-1;
                        
                       e.attributes.selected=true;
                       e.layer.redraw();
                      if(!skipapply && !scope.prgtely)
                            scope.$apply();
                    };
                    
                   var unselect = function(e,skipapply) {
                       if(!e.layer)
                            return;
                       e.attributes.selected=false;
                       if(infoPop)
                             map.removePopup(infoPop);
                       scope.SelectCityById(e.attributes.id,false)
                          if(!skipapply && !scope.prgtely)
                            scope.$apply();
                    };
                    
                    var hover = function(e,skipapply) {
                        if(!e.layer)
                            return;
                       if(cityMarker){
                            citiesLayer.removeFeatures([cityMarker]);
                            cityMarker.destroy();
                            cityMarker=null;
                        }
                         var style_blue = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
                            style_blue.strokeColor = "#777";
                            style_blue.fillColor = "black";
                            style_blue.graphicName = "star";
                            style_blue.pointRadius = 3;
                            style_blue.strokeWidth = 1;
                            style_blue.graphicZIndex = 1;                            


                            var point = new OpenLayers.Geometry.Point(e.geometry.getBounds().getCenterLonLat().lon,e.geometry.getBounds().getCenterLonLat().lat);//e.geometry.getCentroid();
                            cityMarker = new OpenLayers.Feature.Vector(point/*,null,style_blue*/); 
                            cityCenterLayer.addFeatures([cityMarker]);
                        
                        
                        
                       scope.hoveredCity=e.attributes.id*1;
                      if(!e.attributes.scaled){
                           e.attributes.zIndex=10;
                       }
                      
                       e.attributes.scaled=true;
                          highlightCtrl.highlight(e);
                          if(!skipapply)
                            scope.$apply();
                    };
                    
                    var unhover = function(e,skipapply) {
                        if(!e.layer)
                            return;
                        if(cityMarker){
                            citiesLayer.removeFeatures([cityMarker]);
                            cityMarker.destroy();
                            cityMarker=null;
                        }
                       scope.hoveredCity=-1;
                       if(e.attributes.scaled){
                      }
                       e.attributes.scaled=false;
                       if(!e.attributes.selected)
                            highlightCtrl.unhighlight(e);
                        else {
                            e.renderIntent='select';
                            e.layer.redraw();
                        }
                        
                        if(!skipapply)
                            scope.$apply();
                       
                    };
                
                
                
                
                scope.mapControl={
                    SelectCityById:function(id,status,hoverOp){
                        var idx=FindCityById(id);
                        if(idx || idx===0)
                        this.SelectCityByIdx(idx,status,hoverOp);
                        return idx;
                    },
                    SelectCityByIdx:function(idx,status,hoverOp){
                        if(!selectCtrl)
                            return;
                        if(hoverOp){
                            if(status)
                                hover(citiesFt[idx],true);
                            else
                               unhover(citiesFt[idx],true);
                        }
                    else
                        {
                            if(status)
                                selectCtrl.select(citiesFt[idx],true);
                            else
                                selectCtrl.unselect(citiesFt[idx],true);
                        }
                    },
                    AddCity:AddCity,
                    geojson_format:new OpenLayers.Format.GeoJSON({internalProjection:fromProjection,externalProjection:fromProjection})
                    
                };
                function FindCityById(id){
                    if(!citiesFt)
                        return;
                    for(var i=0;i<citiesFt.length;i++){
                        if(citiesFt[i].attributes.id*1===id*1)
                            return i;
                    }
                    return false;
                }
                function resize() {
                    if( !angular.isUndefined(map) && angular.isFunction(map.updateSize))
                    map.updateSize();
                }
                function getData(msa){
                    /*AddCities([]);
                    return;*/
                    $http.get(attrs.url).success(function(arr){
                        data.features=[];
                        arr=arr.length?arr:arr.cities;
                        for(var i=0;i<arr.length;i++){
                            var feat={"type":"Feature","properties":{id:arr[i].gid,name:arr[i].name},geometry:arr[i].shape};
                            data.features.push(feat);
                        }
                        AddCities(data);
                    }).error(
                        function(){
                            var padre=scope.$parent;
                            padre.status='Failed loading Area Map';
                            $timeout(
                            function(){
                                padre.status=''; 
                                padre.$apply();
                            },3000);
                            /*scope.$parent.$apply();*/
                        }
                    )
                    
                }
                
               
               function AddCity(city){
                   
                   //var vector=new OpenLayers.Feature.Vector(city.geometry,{name:city.name,id:city.id});
                   citiesFt.push(city);
                   citiesLayer.addFeatures([city]);
               }
               
                this.ApplyGeoJson=function(data,features,layer,style,name){
                    if(infoPop)
                        
                    if(citiesFt){
                        for(var i=0;i<citiesFt.length;i++)
                            citiesFt[i].destroy();
                    }
                 
                    citiesFt=[];
                    if(highlightCtrl){
                        highlightCtrl.deactivate();
                        selectCtrl.deactivate(); 
                        map.removeControl(highlightCtrl);
                        map.removeControl(selectCtrl);
                        highlightCtrl.destroy();
                        selectCtrl.destroy(); 
                        highlightCtrl=selectCtrl=transfCtrl=null; 
                   }
                
                    if(citiesLayer){
                        map.removeLayer(citiesLayer);
                        citiesLayer.destroy();
                        citiesLayer=null;
                    }
                    
                    
                    
                    var myStyles = style;
                    citiesLayer = new OpenLayers.Layer.Vector(name,{
                            styleMap: myStyles,
                            rendererOptions:{zIndexig:true}
                    });
                    citiesLayer.isBaseLayer=true;
                    map.addLayer(citiesLayer);
                    

                    
                    highlightCtrl = new OpenLayers.Control.SelectFeature(citiesLayer, {
                        hover: true,
                        multiple:false,
                        highlightOnly: true,
                        renderIntent: "temporary",
                        overFeature: hover,
                        outFeature:unhover
                   });


                   selectCtrl = new OpenLayers.Control.SelectFeature(citiesLayer,{
                        clickout:false,
                        toggle:true,
                        multiple:true,
                        box:true,
                        onSelect: select,
                        onUnselect: unselect
                  });
                  selectCtrl.events.register('boxselectionstart',selectCtrl,function(){
                        scope.boxSelect=true;
                        scope.mapStatus='Processing your selection';
                        scope.$apply();
                  })
                        
                  selectCtrl.events.register('boxselectionend',selectCtrl,function(){
                        scope.mapStatus='';
                        scope.boxSelect=false;
                        scope.msa.DeepCheckAll();
                        scope.$apply();
                  })
                    
                  map.addControl(highlightCtrl);
                  map.addControl(selectCtrl);
                  highlightCtrl.activate();
                  selectCtrl.activate(); 
                  
                  citiesFt=scope.mapControl.geojson_format.read(data);
                  map.zoomTo(0);
                   citiesLayer.events.register('featuresadded',citiesLayer,function(){
                    citiesLayer.setZIndex( 2 ); 
                    var bounds=citiesLayer.getDataExtent();
                    var z=map.getZoomForExtent(bounds);
                     z-=0.1;
                     

                    map.zoomTo(z);
                        map.panTo(bounds.getCenterLonLat());
                        map.raiseLayer(citiesLayer,5);
                    //z=Math.floor(z);
                   
                    //map.zoomToExtent(bounds);
                      for(var gidx in scope.msa.groups){
                        var g=scope.msa.groups[gidx];
                        if(!g.cities)
                            continue;
                        for(var cidx in g.cities){
                            var c=g.cities[cidx];
                            if(!c.selected || !c.ToggleSelect)
                                continue;
                            c.ToggleSelect(true);
                        }
                    }
                        $rootScope.$$childHead.status='';
                        $rootScope.$$childHead.$apply();
                   })
                   if(citiesFt)
                 // citiesLayer.addFeaturesSync(citiesFt); 
              citiesLayer.addFeatures(citiesFt); 
              else
                  citiesFt=[];
                  //citiesLayer.isBaseLayer=true;
                  
                 
            }
           
           
        this.AddCities=function(data){
            this.labelDeltaPixels = function (f) {
                var vert = f.geometry.getVertices();
                var startPoint = vert[0];
                var middlePoint = vert[Math.floor(vert.length/2)];
                var pixelStart = self.mapPanel.map.getPixelFromLonLat(new      OpenLayers.LonLat(startPoint.x, startPoint.y));
                var pixelMiddle = self.mapPanel.map.getPixelFromLonLat(new OpenLayers.LonLat(middlePoint.x, middlePoint.y));
                var deltaX = pixelMiddle.x - pixelStart.x;
                var deltaY = pixelStart.y - pixelMiddle.y;
                return {x: deltaX, y: deltaY};
            }
            
            var context = {
                getLableOffsetX: function(f) {
                var zoom = self.mapPanel.map.getZoom();
                if (zoom < self.centreLabelsZoom) {
                    return 0;
                }

                    if (f.geometry) {
                        if (!self.centrelineMiddleCoordsMap[zoom]) {
                         self.centrelineMiddleCoordsMap[zoom] = {};
                        }
                        if (!self.centrelineMiddleCoordsMap[zoom][f.id]) {
                            self.centrelineMiddleCoordsMap[zoom][f.id] =     self.labelDeltaPixels(f);
                        }
                        return self.centrelineMiddleCoordsMap[zoom][f.id].x+10;
                            return 0;
                    } else {
                        return 0;
                    }
                }
            }
            var template = {
                    fillColor:"#f60",
                    label:'${name}',
                    labelXOffset: 5,
                    labelAlign:'lm',
                    graphic:true,
                    pointRadius:20,
                    graphicName:"circle",
                    graphicZIndex:10,
                    fillOpacity:0.5

            };
            var style0 = new OpenLayers.Style(template, {context: context}); 
            var style=new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    fillColor:'#CCC',
                    strokeColor:"#FFFFFF",
                    
                    strokeWidth:"1.5"

                }),
                "select": new OpenLayers.Style({
                    zIndex:4,
                    fillColor:"#666"
                }),
                "temporary":style0
            }); 
            this.ApplyGeoJson(data,citiesFt,citiesLayer,style,'Cities');
        };
  
                
        function drawMap(){
            
            var mapOpt={
                projection: fromProjection,
                displayProjection: fromProjection,
                minScale:50,
                maxScale:100000000000000,
                units: "m",
                fractionalZoom:true,
                allOverlays:true,
                controls:[
                    /*new OpenLayers.Control.Navigation(),
                    new OpenLayers.Control.PanZoomBar(),
                    new OpenLayers.Control.LayerSwitcher()*/
                ]
            };

            map = new OpenLayers.Map($(element).find('#map')[0], mapOpt);
            layer = new OpenLayers.Layer.Google("Google");

            
            
            
            
                    cityCenterLayer = new OpenLayers.Layer.Vector('cityCenter',{
                            styleMap: new OpenLayers.StyleMap({
                                "default": new OpenLayers.Style({
                                    strokeColor : "#777",
                                    fillColor : "black",
                                    graphicName : "star",
                                    pointRadius : 3,
                                    strokeWidth : 1,
                                    graphicZIndex : 1   
                                })
                            })  ,
                            renderOptions:{zIndexig:true},
                            isBaseLayer:true
                    });
                    
                    var point = new OpenLayers.Geometry.Point(0, 0);
                            cityMarker = new OpenLayers.Feature.Vector(point/*,null,style_blue*/); 
                            cityCenterLayer.addFeatures([cityMarker]);
                    map.addLayers([/*layer,*/cityCenterLayer]);

                    
            
            
    }
        scope.$watch(function(){return attrs.url},function(newval, oldval){
            if(!scope.msa)
                return false;
            resize();
            if(!newval || !newval.length || newval.match(/null|undefined/i))
                return;
        
            getData(newval);
    
         });
    
        drawMap();
    }
}
        
    }])
    .directive('mainApp',function(){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                var timeStamp=new Date().getTime();
                    var sc_content='<table cellspacing="20" id="help_table">\
                            <tr><th>Key</th><th>Action</th></tr>\
                            <tr><td>?</td><td>Shortcuts List</td></tr>\
                            <tr><td><a href="javascript:StartTour();">t</a></td><td>Take Tour</td></tr>__CONTENT__\
                            <tr><td><a href="javascript:HideHelp();">Esc</a></td><td>To Exit</td></tr>\
                    </table>';
                    var content='';
                
                
                element.append('<script>function GoTo(selector){\
                            HideHelp();\
                                    $(selector)[0].focus();\
                }\
                function HideHelp(){$(".shortcuts-box, .shortcuts-box-wall").css("display","none");$("#sc_hidden_ctrl")[0].value="";}\
                function ShowHelp(){$(".shortcuts-box-wall").css("height", $($("main_app")[0]).height()+"px"); $(".shortcuts-box, .shortcuts-box-wall").css("display","block");}\
                function StartTour(){\
                    HideHelp();\
                   if(!introJs || introJs==null)\
                        return;\
                   if(!intro){\
                       intro=introJs();\
                       intro.onexit(function(){\
                            $("#sc_hidden_ctrl").focus();\
                       })\
                   }\
                   if($(".introjs-overlay").length){\
                        intro.exit();\
                        $(".introjs-overlay").remove();\
                   }\
                    intro.start();\
                }\
                </script>');
                
                scope.$watch(function(){return attrs.update},function(value){
                    if(angular.isUndefined(value) || !value || !value.length || !scope.helpSc)
                        return
                   content='';
                   for(var i=0;i<scope.helpSc.length;i++){
                        if(scope.helpSc[i].letter && scope.helpSc[i].desc && scope.helpSc[i].sel)
                           content+='<tr><td><a href="javascript:GoTo(\''+scope.helpSc[i].sel+'\')">'+scope.helpSc[i].letter+'</a></td><td><span style="white-space:pre">'+scope.helpSc[i].desc+'</span></td></tr>';
                       else if(scope.helpSc[i].letter && scope.helpSc[i].desc && scope.helpSc[i].fn)
                           content+='<tr><td><a href="javascript:'+scope.helpSc[i].fn+'">'+scope.helpSc[i].letter+'</a></td><td><span style="white-space:pre">'+scope.helpSc[i].desc+'</span></td></tr>';
                      
                   }
                   content=sc_content.replace(/__CONTENT__/g,content);
                   $("#help-content-box").html(content);
                   $("#help-content-box").css("visibility","hidden");
                   $("#help-content-box").css("display","block");
                   $("#help-content-box").css("left","-"+($("#help-content-box").width()/2)+"px");
                   $("#help-content-box").css("display","none");
                   $("#help-content-box").css("visibility","visible");
                   
                   
                    
                })
                
                
               $(element).keyup(function($event){
                   if($event.target.localName=='input' || $event.target.localName=='select' || $('.hidden_before_report').lenght)
                       return;
                   
                   
                   switch($event.keyCode){
                             case 27:{
                                     HideHelp();
                                     return;
                             }
                            case 191:{
                                ShowHelp()
                            }
                             case 84:{
                                     StartTour();

                                    break;
                            }
                           default:{
                                   
                           }
                            
                        }
                   
                    
                });
                
                    $(element).append('<input id="sc_hidden_ctrl" style="position:fixed; left:-20000px; top:0px; opacity:0"><div class="shortcuts-box"  style="z-index:100001" id="help-content-box">'+content+'</div><div class="shortcuts-box-wall" style="z-index:100000"></div>')
                   
                   $('.shortcuts-box-wall').click(function($event){
                       $('.shortcuts-box, .shortcuts-box-wall').css('display','none');
                       $('#sc_hidden_ctrl')[0].value='';
                    });
                    
                   $(element).off('click');
                   $(element).click(function($event){
                        if($event.target.localName!='input' && $event.target.localName!='select')
                            $('#sc_hidden_ctrl').focus();
                    });
                    
                    $(element).focus(function($event){
                       $('#sc_hidden_ctrl').focus();
                    });
                    

                    $('#sc_hidden_ctrl').focus(function($event){
                        $('#sc_hidden_ctrl')[0].value='';
                    });
                    
                     $('#sc_hidden_ctrl').keydown(function($event){
                         switch($event.keyCode){
                             case 9:{
                                     $event.preventDefault();
                                     $event.stopPropagation();
                                     break;
                             }
                         }
                     })
                    
                     $('#sc_hidden_ctrl').keyup(function($event){
                         
                         if($('.hidden_before_report').lenght)
                             return;
                         
                         switch($event.keyCode){
                             case 27:{
                                     HideHelp();
                                     return;
                             }
                             case 9:{
                                      HideHelp();
                                      $('a,input, button,select')[0].focus();
                                     break;
                             }
                             case 191:{

                                     ShowHelp();
                                     break;
                             }
                         }
                        var letter=$('#sc_hidden_ctrl')[0].value;
                        letter=letter.toString().toLowerCase();
                        $('#sc_hidden_ctrl')[0].value='';
                        switch(letter){
                            case 't':{
                                    StartTour();
                                    break;
                            }
                            default:{
                                    for(var i=0;i<scope.helpSc.length;i++){
                                        if(letter==scope.helpSc[i].letter){
                                            if(scope.helpSc[i].sel){
                                                GoTo(scope.helpSc[i].sel);
                                            }
                                            else if(scope.helpSc[i].fn){
                                                eval(scope.helpSc[i].fn+'()');
                                            }
                                        }
                                    }
                            }
                            
                        }
                     })
                    
            }
        }
        
    })
    .directive('expandableContent1',['$timeout',function($timeout){
        return{
            restrict:'AC',
            replace:false,
            link:function(scope,element,attrs){
                var mo=false;
                
                $(element).mouseover(function($event){
                    var h=$(element).children('.hidden-content-cover').height();
                    if(mo)
                        return;
                    mo=true;
                    var hc=element.find('.hidden-content')[0]
                    $(hc).stop();
                    
                    var top=h-$(hc).height()+'px';
                    $timeout(function(){ 
                        if(mo) 
                            $(hc).animate({top:top},500);
                    },200);
                });
                
                $(element).mouseout(function($event){
                    if($($(element)[0].parentNode)[0].parentNode!==$event.relatedTarget)
                        return;
                    
                    
                    var h=$(element).children('.hidden-content-cover').height();
                    mo=false;
                    var hc=element.find('.hidden-content')[0];
                    $(hc).stop();
                    $(hc).animate({top:h+'px'},500);
                });
            }
        };
    }])
    .directive('cityDetails',['$timeout','$location','$rootScope',function($timeout,$location,$rootScope){
        return{
            restrict:'C',
            replace:false,
            transclude:true,
            template:'<div>\
                <div class="pulse-logo"><div class="first"><div>{/{$parent.$parent.$parent.lifestyles[idx].pulses[city.id].total}/}</div></div></div>\
                                <div class="city_name">\
                                <h4>{/{$parent.city.name}/},{/{$parent.$parent.msa.state}/}</h4>\
                                </div>\
                                <div class="separator" style="margin-bottom:20px;"></div>\
                                <button style="float:right; margin-right:5px; " ng-click="$parent.SelectCity($parent.$parent.$index,$parent.$index)" message="Getting Results" class="mobile-touch transparent" prevent="true"><i class="icon-chevron-right"  ></i></button><div style="height:1em" class="padded">{/{$parent.city.category}/}</div>\
                                </div>\
                                <div ng-if="expanded" class="hidden-details">\
                                <div class="separator"> </div>\
                                <h4 class="padded">Pulse Performers</h4>\
                                <ul class="performers-list padded">\
                                        <li ng-repeat="performer in $parent.$parent.$parent.$parent.lifestyles[idx].pulses[city.id].performers"><span>{/{performer.value}/}</span> {/{$parent.$parent.$parent.$parent.$parent.systems[performer.id].name}/}</li>\
                                </ul>\
                                <h5 class="padded">{/{$parent$parent.city.cities.length}/}</h5> Neighborhoods\
                                <table ><tr><td><h6>Crime</h6>{/{$parent.$parent.city.crime}/}</td><td><h6>Traffic</h6>{/{$parent.$parent.city.traffic}/}</td></tr></table>\
                                </div>\
                                <div class="view-more expand-arrow expand-arrow-vertical expand-{/{expanded?\'up\':\'down\'}/}-arrow"></div>',
            scope:{
                
            },
            link:function(scope,element,attrs){
                scope.expanded=false;
                $($(element).find('.view-more')).off('click');
                $($(element).find('.view-more')).click(function($event){
                        scope.expanded=!scope.expanded;

                });
                
                $(element).off('touchstart');
                $(element).bind('touchstart',function($event){
                        $rootScope.$$childHead.status='Preparing Data';
                        $rootScope.$$childHead.$apply();
                        $event.preventDefault();
                        $event.stopImmediatePropagation();
                        $event.stopPropagation();
                        //scope.expanded=!scope.expanded;
                        var link='/lifestylepulse/'+scope.$parent.$parent.$parent.idx+'/'+scope.$parent.$parent.$index+'/'+scope.$parent.$index;
                         $timeout(function(){$location.path(link);},900);

                });
                


            }
        }
    }])
    .directive('mainMap',['$timeout','SelectionService','GeograficService',function($timeout,SelectionService,GeograficService){
        return{
            restrict:'C',
            replace:false,
            scope:{
                stage:'@stage',
                msa:'@msa',
                area:'@area'
            },
            template:'<div style="width:100%; height:100%" id="main-map"></div>',
            link:function(scope,element,attrs){
                var map,marker,markersLayer,projObject;
                var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
                var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
                var zoomControl=new OpenLayers.Control.Zoom();
                var miamiCenter;
                //var usProjection   = new OpenLayers.Projection("EPSG:U4M");
                 var mapserver='http://demo-maps.aboutplace.co/heat';
                //var mapserver='http://geo.urban4m.com/heat';
                                var strTFS,prtTFS=null;
                                
                var Stage1Bounds;
                var url='';
                var TMSLayer=GeoLayer=null;
                var nLayer;
                var min_zoom=0,
                    max_zoom=0;
                function Vector(name,style){
                    this.name=name;
                    this.style=style;
                    this.init(false);
                }
                
                Vector.prototype.init=function(driveMap){
                    if(this.list){
                        for(var i=0;i<this.list.length;i++)
                            this.list[i].destroy();
                    }
                 
                    this.list=[];
                    if(this.hCtrl){
                        this.hCtrl.deactivate();
                        this.sCtrl.deactivate(); 
                        map.removeControl(this.hCtrl);
                        map.removeControl(this.sCtrl);
                        this.hCtrl.destroy();
                        this.sCtrl.destroy(); 
                       this.hCtrl=this.sCtrl=null; 
                   }
                
                    if(this.layer){
                        map.removeLayer(this.layer);
                        this.layer.destroy();
                        this.layer=null;
                    }
                    

                    //var geojson_format = new OpenLayers.Format.GeoJSON({internalProjection:googleProjection,externalProjection:usProjection});
                    this.layer = new OpenLayers.Layer.Vector(this.name,{
                            styleMap: this.style,
                            rendererOptions:{zIndexig:true}
                    });
                    
                    this.layer.isBaseLayer=false;
                    map.addLayer(this.layer);
                    

                    
                    this.hCtrl = new OpenLayers.Control.SelectFeature(this.layer, {
                        hover: true,
                        multiple:false,
                        highlightOnly: true,
                        renderIntent: "temporary",
                       /* overFeature: hover,
                        outFeature:unhover*/
                   });


                   this.sCtrl = new OpenLayers.Control.SelectFeature(this.layer,{
                        clickout:false,
                        toggle:true,
                        multiple:true,
                        box:false
                        /*onSelect: select,
                        onUnselect: unselect*/
                  });
                  /*selectCtrl.events.register('boxselectionstart',selectCtrl,function(){
                        scope.boxSelect=true;
                        scope.mapStatus='Processing your selection';
                        scope.$apply();
                  })
                        
                  selectCtrl.events.register('boxselectionend',selectCtrl,function(){
                        scope.mapStatus='';
                        scope.boxSelect=false;
                        scope.msa.DeepCheckAll();
                        scope.$apply();
                  })*/
                    
                  map.addControl(this.sCtrl);
                  map.addControl(this.hCtrl);
                  this.sCtrl.activate();
                  this.hCtrl.activate(); 
                  
                  
                  
                  if(!driveMap)
                      return;
                  var _self=this;
                   this.layer.events.register('featuresadded',citiesLayer,function(){
                       _self.stretch();

                    
                   })
            }
           
                Vector.prototype.stretch=function(){
                    this.layer.setZIndex( 2 ); 
                    var bounds=this.lLayer.getDataExtent();
                    var z=map.getZoomForExtent(bounds);
                     //z-=0.1;
                    map.zoomTo(z);
                    map.panTo(bounds.getCenterLonLat());
                    map.raiseLayer(this.layer,5);
                }
                
                
                Vector.prototype.addFeatures=function(ft){
                    var FT;
                   if(ft.type && FT.type.toLowerCase()==='feature collection')
                       FT=ft;
                   else{
                       FT={type:"FeatureCollection", features:[]};
                       if(ft.length)
                           for(var i=0;i<ft.length;i++)
                               FT.features.push(formatFeature(ft[i]));
                       else
                           FT.features.push(formatFeature(ft));
                       
                   }
                    var geojson_format = new OpenLayers.Format.GeoJSON({internalProjection:fromProjection,externalProjection:fromProjection});
                    var list=geojson_format.read(FT);
                    this.list.concat(list);
                    this.later.addFeatures(list);
                    
                };
                 
                function formatFeature(ft){
                    return{"type":"Feature","properties":{id:ft.id||ft.gid,name:ft.name},geometry:ft.g};
                };
                
                scope.UpdateUrl=function(partq){
                   // strTFS.url='api.urban4m.com/heat'+partq;
                }
                
                function ChangeOverlay(lpath,fend){
                    path=lpath;
                    if(TMSLayer){
                        map.removeLayer(TMSLayer);
                        TMSLayer.destroy();
                    }
                
                    TMSLayer=new OpenLayers.Layer.TMS('Raster',url,{
                        serviceVersion:'',
                        layername:'.',
                        isBaseLayer:false,
                        opacity:1,
                        type:'png',
                        tileSize:new OpenLayers.Size(256,256),
                        getURL: function (bounds) {
                            var res = this.map.getResolution();
                            var z = this.map.getZoom();
                        //res=
                            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
                            var y = Math.round((bounds.bottom - this.tileOrigin.lat) / (res * this.tileSize.h));
                        
                        /*if (this.map.baseLayer.name == 'Virtual Earth Roads' || this.map.baseLayer.name == 'Virtual Earth Aerial' || this.map.baseLayer.name == 'Virtual Earth Hybrid') {
                            
                            z = z + 1;
                        }*/
                            if (mapBounds.containsBounds( bounds,true,false ) && z >= 8 && z <= 11 ) {
                            //console.log( this.url + z + "/" + x + "/" + y + "." + this.type);
                            
                                return this.url +"&zoom="+z+'&tl='+bounds.left+ "&br=" + bounds.bottom;
                            } else 
                                return false;
                            //return "http://www.maptiler.org/img/none.png";
                        } 
                    });
                    map.addLayer(TMSLayer);
                    if(GeoLayer)
                        map.raiseLayer(GeoLayer,2);
                    map.raiseLayer(markersLayer,3);
                    if(angular.isFunction(fend)) {
                        fend();
                    }
                //this.obj.setBaseLayer(this.TMSLayer);
            };
                
                function placeMarker(ltln,icon) {
                    var size = new OpenLayers.Size(26,40);
                    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
                    var  marker_icon = new OpenLayers.Icon(icon||'http://www.openlayers.org/dev/img/marker.png', size, offset);
       
                    var marker=new OpenLayers.Marker(ltln,marker_icon);
                    markersLayer.addMarker(marker);
                    //marker.events.register("mouseover", marker, function(){ele.style.cursor = "pointer";});
                    //marker.events.register("mouseout", marker, function(){ele.style.cursor = "default";}); 
                    return marker;
                }
        
                function deleteMarker(marker) {
                    if(marker){
                        markersLayer.removeMarker(marker);
                        marker.destroy();
                        marker=null;
                    }
                }
                
                function resize() {
                    if( !angular.isUndefined(map) && angular.isFunction(map.updateSize))
                    map.updateSize();
                    
                    }
                
                function drawMap(){
       

                var mapOpt={
                minZoomLevel: 11,
                    maxZoomlevel:14,
                    tilesize:OpenLayers.Size(256,256),
                    projection:"EPSG:4326",
                    fractionalZoom:true,
                    displayProjection: fromProjection,
                    units: "m",
                    /*maxResolution: 156543.0339,
                    maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34) ,*/
                    controls:[
                        new OpenLayers.Control.Navigation({'zoomWheelEnabled':false}),
                        /* new OpenLayers.Control.CacheRead(),
                         new OpenLayers.Control.CacheWrite({
                            autoActivate: true,
                            imageFormat: "image/png",
                            eventListeners: {
                                cachefull: function() { }
                            }
                        })*/
                        //new OpenLayers.Control.Zoom(),
                        //new OpenLayers.Control.MousePosition()
                       //new OpenLayers.Control.PanZoomBar(),
                        //new OpenLayers.Control.LayerSwitcher()
                    ]
                };


                map = new OpenLayers.Map($(element).find('#main-map')[0], mapOpt);
                nLayer=new OpenLayers.Layer.OSM('U4M',[
                    mapserver+"/${z}/${x}/${y}.png?"+SelectionService.map_query
                    
                    ],{
                        isBaseLayer:true,
                        tileOptions: {crossOriginKeyword: null},
                        transitionEffect: 'resize'
                    });
                     
                    map.addLayer(nLayer); 



                markersLayer=new OpenLayers.Layer.Markers( "Markers" );
                map.addLayer(markersLayer);
                
                
                                var contHL = {
                    getStrokeColor: function(f) {
                        var zoom = self.mapPanel.map.getZoom();
                        if (zoom < 10) 
                            return 'transparent';
                        else
                            return 'black'
                }
            }
            var template = {
                    fillColor:"#f60",
                    fillOpacity:0.5

            };
            var styleHL = new OpenLayers.Style(template, {context: contHL}); 
            var style=new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    fillColor:'#CCC',
                    strokeColor:"#FFFFFF",
                    
                    strokeWidth: "1.5"

                }),
                "select": new OpenLayers.Style({
                    zIndex:4,
                    fillColor:"#666"
                }),
                "temporary":styleHL
            });
                
                var nbds=new Vector('Neighborhoods',style)
                
            Stage1Bounds=new OpenLayers.Bounds(-150,24,-67,49).transform(
                    fromProjection,
                    map.getProjectionObject());
                    
           miamiCenter=new OpenLayers.LonLat(-80.26, 25.81).transform(
                    fromProjection,
                    map.getProjectionObject()
                )
                
}

    
    drawMap();
    map.zoomToProxy = map.zoomTo;
    map.zoomTo =  function (zoom,xy){
        if(zoom<min_zoom)
            zoom=min_zoom;
        else if(zoom>max_zoom)
            zoom=max_zoom;
        map.zoomToProxy(zoom,xy); 
    };

    
    
    
    scope.$watch(function(){return attrs.resize},function(value){
        /*if(value && value.length && value!='false' && map && !angular.isUndefined(map.updateSize))
            $timeout(function(){
                map.updateSize();
                if(marker)
                    map.setCenter(marker.lonlat)
            })*/
            
    })
    
    scope.$watch('stage',function(nv, ov){
        $timeout(function(){
        if(+nv===3){
            min_zoom=11;
            max_zoom=14;
           map.setCenter(miamiCenter,12);
            map.addControl(zoomControl);
        }
        else{ 
            if(+ov===3)
                map.removeControl(zoomControl);
            if(nv==1){
                min_zoom=4;
                max_zoom=5;
                var zoom=map.getZoomForExtent(Stage1Bounds);
               map.zoomTo(Math.round(zoom));
               var h1=Stage1Bounds.getCenterLonLat()
               map.setCenter(h1);
                    
           }
            else if(nv==2){
                min_zoom=7;
                max_zoom=9;
                map.setCenter(miamiCenter,8);
            }
        }
        });
    })
    
    scope.$on('selectedSystemsChanged',function(){
        
        
        if(+scope.stage===3){
            nLayer.url=[mapserver+"/${z}/${x}/${y}.png?"+SelectionService.map_query];
            nLayer.redraw();
        }
    });     
    $timeout(function(){resize();},100);
    
             }
        }
        
    }])
    .directive('u4mPulse',function(){
        return{
            restrict:'C',
            replace:true,
            scope:{
                pulse:'@pulse'
            },
            template:'<div class="pulse-logo"><div class="first"><div>{/{pulse}/}</div></div></div>'
        }
    })
    .directive('nhbdResume',function(){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element){
               function PresentData(){
                   var results='';
                   for(var i in scope.nhbd.obj){
                       if(i.match(/\bname\b|\bpopulation\b|\bid\b|\$|\bpulse\b|\bpinned\b|\bcompare\b/i) || angular.isFunction(scope.nhbd.obj[i]) || angular.isArray(scope.nhbd.obj[i]) || angular.isObject(scope.nhbd.obj[i]))
                           continue;
                       results+=i+'='+scope.nhbd.obj[i]+'<br/>';
                   }
                   element.find('.compare_content').html(results);
               } 
               
               PresentData();
            }
        }
    })
    .directive('signupBox',function(){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                scope.$watch(function(){ return attrs.prev},function(){
                    element.find('.custom_content .cont').html(attrs.prev);
                })
            }
        }
    })
    .directive('shareOnFinish',function(){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                element.append('<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?\'http\':\'https\';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+\'://platform.twitter.com/widgets.js\';fjs.parentNode.insertBefore(js,fjs);}}(document, \'script\', \'twitter-wjs\');</script>\
<div id="fb-root"></div>\
<script>(function(d, s, id) {\
  var js, fjs = d.getElementsByTagName(s)[0];\
  if (d.getElementById(id)) return;\
  js = d.createElement(s); js.id = id;\
  js.src = "//connect.facebook.net/es_ES/all.js#xfbml=1&appId=365039066921848";\
  fjs.parentNode.insertBefore(js, fjs);\
}(document, \'script\', \'facebook-jssdk\'));');
            }
        }
    })
    .directive('lfGroup',['$timeout','$compile',function($timeout,$compile){
           return {
               restrict:'E',
               scope:{
                  
               },
               template:'<span class="lf_group"></span>',
               replace:true,
               link:function(scope,element,attrs){
                   var group=scope.$parent.g;
                   element.children().remove();
                   scope.show=false;
                   $('.groups_cont .popover').remove();
                   var list='<div class="upopover bottom fade in" ng-cloak ng-show="show"><div class="arrow"> </div><div class="popover-title" style="display:none"></div><div class="popover-content"><ul><li ng-repeat="s in $parent.g.children" style="clear:both; float:none;" class="system-list-elem" ng-class="{prioritized:isPriority(s.code)}"><button ng-click="$parent.$parent.$parent.ToggleSystem($event,s)" class="transparent system-selection-button"><i class="mapicon_{/{$parent.$parent.lifeStyle.systems[s.code].active?\'active\':\'inactive\'}/}_system"></i>{/{s.name}/}</button><button class="mobile-touch transparent system-priority-button" prevent="true" ng-click="Prioritize($event,s)" arg="{/{s.code}/}"><i class="mapicon_star_{/{isPriority(s.code)}/}"  ng-class="{disabled:$parent.$parent.$parent.prioritiesFull}"></i></button></li></ul></div></div>';


                   //list='hola';
                   var html=$compile('<button id="menu_grou_'+group.uid+'" class="btn lfgroup-button color-coded lfgroup-'+group.code+'" ng-click="toggle($event)" ng-class="{even:$parent.$odd}"><div class="code" ng-class="{disabled:!$parent.$parent.lifeStyle.groups[$parent.g.id].systemsArr.length}"><div>{/{$parent.$parent.lifeStyle.groups[$parent.g.id].systemsArr.length|| "0"}/}</div></div>'+group.name+'</button>'+list)(scope);
                   
                   element.append(html);
                   $timeout(function(){
                       $(element).children('button').bind('touchstart',function($event){scope.toggle($event,true)});
                   });

                   scope.toggle=function($event,open){
                       $event.preventDefault();
                       $event.stopImmediatePropagation();
                       $event.stopPropagation();
                       scope.show=!scope.show||open;
                        
                       var phase = scope.$root.$$phase;
                
                        if(phase != '$apply' && phase != '$digest')
                        scope.$apply();
                        scope.$parent.$parent.$broadcast('collapse',group.id);
                   };
                   
                   scope.Prioritize=function($event,sys){
                      if($event){
                          $event.stopPropagation();
                          $event.preventDefault();
                      }
                      scope.$parent.Prioritize(sys);
                  }  
                  
                  
                  scope.isPriority=function(id){
                      return scope.$parent.isPriority(id);
                  };
                   
                   
                   scope.$on('collapse',function($event,id){
                       if(id!==group.id)
                           scope.show=false;
                       
                        var phase = scope.$root.$$phase;
                
                        if(phase != '$apply' && phase != '$digest')
                        scope.$apply();
                   })
               }
               
           }
      }])
    .directive('resizeable',function(){
        return{
            restrict:'C',
            link:function(scope,element,attrs){
                var  skipRender=attrs.skipRender;
                function adjust(){
                    var wa=0,
                    ha=0;
                    
                    if(attrs.widthAdjust && attrs.widthAdjust.length){
                       
                        if(angular.isNumber(attrs.widthAdjust))
                            wa=+attrs.widthAdjust;
                        
                        else{
                            var elems=attrs.widthAdjust.split(',');
                            for(var i=0;i<elems.length;i++)
                                wa+=$(elems[i]).outerWidth();
                        }
                        var ref=attrs.global?$(window).width():$($(element)[0].parentNode).width();
                        $(element).css('width',(ref-wa)+'px');
                    }
                    
                    if(attrs.heightAdjust && attrs.heightAdjust.length){
                       
                        
                        if(angular.isNumber(attrs.heightAdjust)){
                            ha=+attrs.heightAdjust;
                        }
                        else{
                            var elems=attrs.heightAdjust.split(',');
                            for(var i=0;i<elems.length;i++){
                                ha+=$($(elems[i])[0]).outerHeight(true)||0;
                            }
                        }
                        var ref=attrs.global?$(window).height():$($(element)[0].parentNode).height();
                        $(element).css('height',(ref-ha)+'px');
                    }
                }
                if(!skipRender){
                    adjust();
                    $(window).bind('resize',function(){
                        adjust();
                    })
                }
                scope.$on('viewAnimEnd',function(){
                    adjust();
                    if(skipRender){
                        adjust();
                        $(window).bind('resize',function(){
                            adjust();
                        })
                        skipRender=false;
                    }
                })
                scope.$watch(function(){return attrs.sizeUpdate},function(val){
                    if(val!=='undefined' && val !=='null' )
                        adjust();
                    
                })
            }
            
        }
      })
    .directive('scrollable',['$timeout',function($timeout){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                $(element).perfectScrollbar();
                
                if(attrs.auto){
                    var auto=attrs.auto;
                    /*if(auto==='self'){
                        $(element).resize(function(){
                          // $(element).perfectScrollbar('update');
                        });
                    }*/
                }
                
                scope.$watch(function(){return attrs.update;},function(){
                    var sidebar=$('.nbds_leftbar');
                        if(sidebar.length)
                            $(sidebar[0]).css('height',$(sidebar[0]).height()+'px');
                        
                    $timeout(function(){
                        var el=$(element);
                         el.perfectScrollbar('update');
                        if(sidebar.length)
                            $timeout(function(){
                                $(sidebar[0]).removeAttr('style');
                            },100);
                    });
                })
                
                $(element).scroll(function(event){
                      $(element).find('.static_element').each(function(i,elem){
                          
                          var left=$(elem).attr('data-static-left');
                          var top=$(elem).attr('data-static-top');
                          if(left.toString().toLowerCase()!=='nan'){
                              left*=1;
                           // left+=$(element).scrollLeft();
                            $(elem).css('left',left+'px');
                          }
                          if(top.toString().toLowerCase()!=='nan'){
                              top*=1;
                            //top+=$(element).scrollTop();
                            $(elem).css('top',top+'px');
                          }
                          $(elem).css('position','fixed');
                      });
                });
             }
        };
        
    }])
    .directive('updateScrolls',['$timeout',function($timeout){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
               function update(){
                if(attrs.parent)
                    $timeout(
                        function(){
                            $($(element).parentNode).perfectScrollbar('update');
                        }
                    )
                if(attrs.child)
                    $(element).find('.scrollable').perfectScrollbar('update');
                if(attrs.self)
                    $(element).perfectScrollbar('update');
                if(attrs.nodeId)
                    $('#'+attrs.nodeId+'.scrollable').perfectScrollbar('update');
                if(attrs.clase)
                    $('.'+attrs.clase+'.scrollable').perfectScrollbar('update');
                if(attrs.tagName)
                    $(attrs.tagName+'.scrollable').perfectScrollbar('update');
                
               }
               $timeout(function(){update()});
               
               if(attrs.click==='true'){
                   $(element).bind('click',function($event){
                        $timeout(function(){update();},20);
                   });
               }
             }
        }
        
    }])
    .directive('staticElement',['$timeout','$rootScope',function($timeout,$rootScope){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                var off=$(element).offset();
                var st=$(element).scrollTop();
                var sl=$(element).scrollLeft();
                
                $(element).attr('data-static-left',off.left+sl);
                $(element).attr('data-static-top',off.top+st);
                
             }
        }
    }])
    .directive('dropdown',['$timeout','$rootScope',function($timeout,$rootScope){
        return{
            restrict:'C',
            replace:false,
            scope:{
               
            },
            link:function(scope,element,attrs){
                 scope.localstatus='';
                 $(element).children('.dropdown-button').off('click');
                $(element).children('.dropdown-button').click(function($event){
                    /*$(element).toggleClass('open');
                    $rootScope.$broadcast('collapse',-3);*/
                    $timeout(function(){
                        $rootScope.$broadcast('collapse',-3);
                    });
                    
                    $event.stopPropagation();
                    $event.preventDefault();

                });
                
                scope.$on('collapse',function($event,id){
                    if(id!==-3)
                        $(element).removeClass('open');
                    else
                       $(element).toggleClass('open');  
                })
             }
        }
    }])
    .directive('ieDimAdjust',['$timeout','$rootScope',function($timeout,$rootScope){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                scope.$watch(function(){
                    return attrs.iewidth;
                },function(val,val2){
                    if(val && val.match('%|px')){
                        $(element).css('width',val);
                    }
                });
                
                scope.$watch(function(){
                    return attrs.ieheight;
                },function(val){
                    if(val && val.match('%|px')){
                        $(element).css('height',val);
                    }
                });
                
                scope.$watch(function(){
                    return attrs.iemarginleft;
                },function(val){
                    if(val && val.match('%|px')){
                        $(element).css('margin-left',val);
                    }
                });
                
                scope.$watch(function(){
                    return attrs.iemarginright;
                },function(val){
                   if(val && val.match('%|px')){
                        $(element).css('margin-right',val);
                    }
                });
            }
        };
    }])
    .directive('statusReport',['$timeout','$rootScope',function($timeout,$rootScope){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                scope.$watch(function(){
                    return attrs.hide;
                },function(val,val2){
                    if(!val || val==='true'){
                        $(element).css('display','none');
                    }
                    else
                        $(element).css('display','block');
                });
            }
        };
    }])  
    .directive('mobileTouch',['$timeout','$location','$rootScope',function($timeout,$location,$rootScope){
        return{
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                scope.tapped=false;
                scope.touchstarttime=null;
               $(element).off('touchstart');
               element.bind('touchstart',function($event){
                   scope.tapped=true;
                   scope.touchstarttime=Date.now();
               });
               //if(attrs.prevent==='true'){
                   $(element).bind('touchmove',function($event){
                       scope.tapped=false;
                   });
                   
                   $(element).bind('touchend',function($event){
                       if(!scope.tapped){
                          scope.touchstarttime=null;
                          return;
                       }
                       scope.tapped=false;
                         if(attrs.prevent && attrs.prevent==='true')
                        $event.preventDefault();
                   $event.stopImmediatePropagation();
                   $event.stopPropagation();
                   var str=null;
                   if(attrs.message)
                       str=attrs.message;
                   
                   var link='';
                   var path=$location.path();
                   if(attrs.href){
                      str=str||'Getting There';
                      link=attrs.href.replace(/#/,'');
                      if(link===path)
                          return;
                   
                   
                   }
                   
                   /*alert(str);
                   return;*/
   
                   

                   if(str){

                          $('#status_message').html(str);
                           $('.status-report').css('display','block');
                       
                           $rootScope.$$childHead.status=str;
                      
                      
                   }
               $timeout(
                   function(){
                   if(attrs.href){

                        $timeout(function(){$location.path(link);},900);
                    
                   }
               //return;
                   if(attrs.ngClick){
                        $timeout(function(){scope.$apply(attrs.ngClick);},100);
                                   
                   }
                   },100);

                        //scope.$eval(attrs.ngClick);
                    
                   
                   

                       
                       
               
                       
                   });
                   
               //}
            }
        };
    }])         
    .directive('compareMap',['$timeout','$rootScope','$http','CompareService',function($timeout,$rootScope,$http,CompareService){
        return{
            restrict:'C',
            replace:false,
            scope:{
                update:'@update'
            },
            template:'<div style="width:100%; height:100%" id="map"></div>',
            link:function(scope,element,attrs){
                var map,projObject,layer,infoPop;
                var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
                var googleProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
                //var usProjection   = new OpenLayers.Projection("EPSG:U4M"); // to
                var nbhdsFt=[], nbhdsLayer,markersLayer,nbhdsMarkers=[],lids=[];
                var highlightCtrl,selectCtrl,transfCtrl=null;
                var self=this;
                
                /*var select = function(e,skipapply) {
                        if(e.attributes.scaled){
                            e.attributes.zIndex=1;
                            e.attributes.scaled=false;
                        }
                         scope.hoveredCity=-1;
                         var city=scope.SelectCityById(e.attributes.id,true);
                         if(infoPop)
                             map.removePopup(infoPop);
                         infoPop=new OpenLayers.Popup.Anchored("city_detail",
                            e.geometry.bounds.centerLonLat,
                            new OpenLayers.Size(200,200),
                            "example popup",null,
                            true);
                            infoPop.panMapIfOutOfView=false;
                            //infoPop.keepInMap=true;
                         
                         map.addPopup(infoPop);
                         
                         
                       e.attributes.selected=true;
                       e.layer.redraw();
                      if(!skipapply && !scope.prgtely)
                            scope.$apply();
                    };
                    
                   var unselect = function(e,skipapply) {
                       e.attributes.selected=false;
                       if(infoPop)
                             map.removePopup(infoPop);
                       scope.SelectCityById(e.attributes.id,false)
                          if(!skipapply && !scope.prgtely)
                            scope.$apply();
                    };
                    
                    var hover = function(e,skipapply) {
                       if(cityMarker){
                            citiesLayer.removeFeatures([cityMarker]);
                            cityMarker.destroy();
                            cityMarker=null;
                        }
                         var style_blue = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
                            style_blue.strokeColor = "#777";
                            style_blue.fillColor = "black";
                            style_blue.graphicName = "star";
                            style_blue.pointRadius = 3;
                            style_blue.strokeWidth = 1;
                            style_blue.graphicZIndex = 1;                            


                            var point = new OpenLayers.Geometry.Point(e.geometry.getBounds().getCenterLonLat().lon,e.geometry.getBounds().getCenterLonLat().lat);//e.geometry.getCentroid();
                            cityMarker = new OpenLayers.Feature.Vector(point); 
                            cityCenterLayer.addFeatures([cityMarker]);
                        
                        
                        
                       scope.hoveredCity=e.attributes.id*1;
                      if(!e.attributes.scaled){
                           e.attributes.zIndex=10;
                       }
                      
                       e.attributes.scaled=true;
                          highlightCtrl.highlight(e);
                          if(!skipapply)
                            scope.$apply();
                    };
                    
                    var unhover = function(e,skipapply) {
                        if(cityMarker){
                            citiesLayer.removeFeatures([cityMarker]);
                            cityMarker.destroy();
                            cityMarker=null;
                        }
                       scope.hoveredCity=-1;
                       if(e.attributes.scaled){
                      }
                       e.attributes.scaled=false;
                       if(!e.attributes.selected)
                            highlightCtrl.unhighlight(e);
                        else {
                            e.renderIntent='select';
                            e.layer.redraw();
                        }
                        
                        if(!skipapply)
                            scope.$apply();
                       
                    };
                
                
                
                
                scope.mapControl={
                    SelectCityById:function(id,status,hoverOp){
                        var idx=FindCityById(id);
                        if(idx || idx===0)
                        this.SelectCityByIdx(idx,status,hoverOp);
                        return idx;
                    },
                    SelectCityByIdx:function(idx,status,hoverOp){
                        if(!selectCtrl)
                            return;
                        if(hoverOp){
                            if(status)
                                hover(citiesFt[idx],true);
                            else
                               unhover(citiesFt[idx],true);
                        }
                    else
                        {
                            if(status)
                                selectCtrl.select(citiesFt[idx],true);
                            else
                                selectCtrl.unselect(citiesFt[idx],true);
                        }
                    },
                    AddCity:AddCity,
                    geojson_format:new OpenLayers.Format.GeoJSON({internalProjection:fromProjection,externalProjection:fromProjection})
                    
                }*/
                function Find(id){
                    if(!nbhdsFt)
                        return false;
                    for(var i=0;i<citiesFt.length;i++){
                        if(citiesFt[i].attributes.id*1==id*1)
                            return i;
                    }
                    return false;
                }
                function resize() {
                    if( !angular.isUndefined(map) && angular.isFunction(map.updateSize))
                    map.updateSize();
                }
            function getData(){
                lids=[];
                    var locales=CompareService.GetElements();
                     var features=[];
                     var pointers=[];
                        for(var i=0;i<locales.length;i++){
                            lids.push(locales[i].obj.gid);
                            if(locales[i].obj.shape){
                                var feat={"type":"Feature","properties":{id:locales[i].obj.gid,name:locales[i].obj.name},geometry:locales[i].obj.shape};
                                features.push(feat);
                            }
                            if(locales[i].obj.center){
                                var point={id:locales[i].obj.gid,name:locales[i].obj.name,center:locales[i].obj.center};
                                pointers.push(point);
                            }
                                
                                
                        }
                        AddLocales(features,pointers);
            }
                
            this.ApplyGeoJson=function(data,features,layer,style,name){
                    if(infoPop)
                        
                    if(nbhdsFt){
                        for(var i=0;i<nbhdsFt.length;i++)
                            nbhdsFt[i].destroy();
                    }
                 
                    nbhdsFt=[];
                    if(highlightCtrl){
                        highlightCtrl.deactivate();
                        selectCtrl.deactivate(); 
                        map.removeControl(highlightCtrl);
                        map.removeControl(selectCtrl);
                        highlightCtrl.destroy();
                        selectCtrl.destroy(); 
                        highlightCtrl=selectCtrl=transfCtrl=null; 
                   }
                
                    if(nbhdsLayer){
                        map.removeLayer(nbhdsLayer);
                        nbhdsLayer.destroy();
                        nbhdsLayer=null;
                    }
                    
                    
                    
                    var myStyles = style;
                    nbhdsLayer = new OpenLayers.Layer.Vector(name,{
                            styleMap: myStyles,
                            rendererOptions:{zIndexig:true}
                    });
                    nbhdsLayer.isBaseLayer=true;
                    map.addLayer(citiesLayer);
                    

                    
                    highlightCtrl = new OpenLayers.Control.SelectFeature(nbhdsLayer, {
                        hover: true,
                        multiple:false,
                        highlightOnly: true,
                        renderIntent: "temporary",
                        overFeature: hover,
                        outFeature:unhover
                   });


                   selectCtrl = new OpenLayers.Control.SelectFeature(nbhdsLayer,{
                        clickout:false,
                        toggle:true,
                        multiple:true,
                        box:true,
                        onSelect: select,
                        onUnselect: unselect
                  });
                  selectCtrl.events.register('boxselectionstart',selectCtrl,function(){
                        scope.boxSelect=true;
                        scope.mapStatus='Processing your selection';
                        scope.$apply();
                  })
                        
                  selectCtrl.events.register('boxselectionend',selectCtrl,function(){
                        scope.mapStatus='';
                        scope.boxSelect=false;
                        scope.msa.DeepCheckAll();
                        scope.$apply();
                  })
                    
                  map.addControl(highlightCtrl);
                  map.addControl(selectCtrl);
                  highlightCtrl.activate();
                  selectCtrl.activate(); 
                  
                  nbhdsFt=scope.mapControl.geojson_format.read(data);
                  map.zoomTo(0);
                   nbhdsLayer.events.register('featuresadded',nbhdsLayer,function(){
                    nbhdsLayer.setZIndex( 2 ); 
                    var bounds=nbhdsLayer.getDataExtent();
                    var z=map.getZoomForExtent(bounds);
                     z-=0.1;
                     

                    map.zoomTo(z);
                        map.panTo(bounds.getCenterLonLat());
                        map.raiseLayer(nbhdsLayer,5);
                    //z=Math.floor(z);
                   
                    //map.zoomToExtent(bounds);

                    
                   })
                   if(nbhdsFt)
                  nbhdsLayer.addFeaturesSync(nbhdsFt); 
              else
                  nbhdsFt=[];
                  //citiesLayer.isBaseLayer=true;
                  
                 
            }
           
           
            this.AddLocales=function(data){
                this.labelDeltaPixels = function (f) {
                    var vert = f.geometry.getVertices();
                    var startPoint = vert[0];
                    var middlePoint = vert[Math.floor(vert.length/2)];
                    var pixelStart = self.mapPanel.map.getPixelFromLonLat(new      OpenLayers.LonLat(startPoint.x, startPoint.y));
                    var pixelMiddle = self.mapPanel.map.getPixelFromLonLat(new OpenLayers.LonLat(middlePoint.x, middlePoint.y));
                    var deltaX = pixelMiddle.x - pixelStart.x;
                    var deltaY = pixelStart.y - pixelMiddle.y;
                    return {x: deltaX, y: deltaY};
                }
            
                var context = {
                    getLableOffsetX: function(f) {
                        var zoom = self.mapPanel.map.getZoom();
                        if (zoom < self.centreLabelsZoom) {
                            return 0;
                        }

                        if (f.geometry) {
                            if (!self.centrelineMiddleCoordsMap[zoom]) {
                                self.centrelineMiddleCoordsMap[zoom] = {};
                            }
                            if (!self.centrelineMiddleCoordsMap[zoom][f.id]) {
                                self.centrelineMiddleCoordsMap[zoom][f.id] =     self.labelDeltaPixels(f);
                            }
                            return self.centrelineMiddleCoordsMap[zoom][f.id].x+10;
                            return 0;
                        } else {
                            return 0;
                        }
                    }
                }
                var template = {
                    fillColor:"#f60",
                    label:'${name}',
                    labelXOffset: 5,
                    labelAlign:'lm',
                    graphic:true,
                    pointRadius:20,
                    graphicName:"circle",
                    graphicZIndex:10,
                    fillOpacity:0.5

                };
                var style0 = new OpenLayers.Style(template, {context: context}); 
                var style=new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style({
                        fillColor:'#CCC',
                        strokeColor:"#FFFFFF",
                        strokeWidth:"1.5"
                    }),
                    "select": new OpenLayers.Style({
                        zIndex:4,
                        fillColor:"#666"
                    }),
                    "temporary":style0
                }); 
                
                this.ApplyGeoJson(data,nbhdsFt,nbhdsLayer,style,'Locales');
                
                scope.$parent.$broadcast('addedLocales',lids);
            }
  
                
        function drawMap(){
            
            var mapOpt={
                projection: fromProjection,
                displayProjection: fromProjection,
                minZoom:8,
                maxZoom:18,
                minScale:50,
                maxScale:100000000000000,
                units: "m",
                fractionalZoom:false,
                allOverlays:false,
                controls:[
                    new OpenLayers.Control.Navigation(),
                    new OpenLayers.Control.PanZoomBar(),
                    new OpenLayers.Control.LayerSwitcher()
                ]
            };

            map = new OpenLayers.Map($(element).find('#map')[0], mapOpt);
            layer = new OpenLayers.Layer.Google("Google");
             map.addLayers([layer]);

                    
            $(element).resize(function(){
                resize();
            });
            map.zoomTo(8);
        }


               
        scope.$watch('update',function(newval, oldval){
              //getData(newval);
              resize();
         });
    
         scope.$on('viewAnimEnd',function(){
             resize();
        });
    
        drawMap();
    }
};
        
    }])
    .directive('systemListElem',['$timeout',function($timeout){
        return {
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                $(element).children('.system-priority-button').bind('touchstart',function($event){
                    scope.$parent.Prioritize($event,scope.sys);
                });
                
                $(element).children('.system-selection-button').bind('touchstart',function($event){
                    scope.$parent.$parent.$parent.$parent.ToggleSystem($event,scope.sys);
                });
            }
            
            
        };
    }])
    .directive('cityNameSelector',['$timeout',function($timeout){
        return {
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                scope.ToggleCity=function(){
                    scope.city.selected=!scope.city.selected; 
                    scope.city.ToggleSelect(); 
                    scope.$parent.SelectCity(scope.$parent.$index,scope.$index)
                }}
            
            
        };
    }])
    .directive('nhbdToggler',['$timeout',function($timeout){
        return {
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                scope.SelectArea=function(){
                    scope.$parent.SelectArea(scope.$index);
                }}
            
            
        };
    }])
    .directive('prioBreadcrom',['$timeout',function($timeout){
        return {
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                scope.Remove=function($event){
                    $event.preventDefault();
                    $event.stopPropagation();
                    scope.$parent.Prioritize(scope.$parent.lifeStyle.systems[scope.p]);
                }}
            
            
        };
    }])
    .directive('apDropdown',['$timeout','$rootScope',function($timeout,$rootScope){
        return {
            restrict:'C',
            replace:false,
            scope:{
                arr:'@arr'
            },
            template:'<div ng-click="Toggle($event)">Select a City</div><div ng-show="show" class="dropdown-content"><a href="#/msa/{/{$index}/}" class="mobile-touch" ng-repeat="elem in list">{/{elem.name}/}</a></div>',
            link:function(scope,element,attrs){
                scope.show=false;
                scope.Toggle=function($event){
                    if($event){
                        $event.stopPropagation();
                        $event.preventDefault();
                        $event.stopImmediatePropagation();
                    }
                    scope.show=!scope.show
                    $rootScope.$broadcast('collapse',scope.arr);
                };
                
                scope.$watch('arr',function(){
                    scope.list=scope.$parent[scope.arr];
                    
                });
                
                scope.$on('collapse',function($event,id){
                    if(id!=scope.arr)
                        scope.show=false;
                        
                })
            }
            
            
        };
    }])
    .directive('lifestyleElem',['$timeout',function($timeout){
        return {
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                scope.fir=(scope.$index%3)===0;
                var num=scope.$index+1;
                /*scope.big=(scope.$index%6)===0 || (num%6)===0;*/
                scope.reverse=(Math.floor(scope.$index/3)%2!==0) && scope.$index!==0;
            }
               
        };
    }])
;
