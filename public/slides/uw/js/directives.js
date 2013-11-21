angular.module('Directives',['LocalServices'/*,'MapModule'*/])
   .directive('vectorMap',['$timeout','$rootScope','$http',function($timeout,$rootScope,$http){
        return{
            restrict:'C',
            replace:false,
            template:'<div style="width:100%; height:100%" id="map"></div>\
            <div class="map-status-report reported_true" ng-show="mapStatus.length>0" style="z-index:7001">\
                <img src="./images/loading.gif" style="margin-right:0.5em; width:2em;"><span id="map_status_message">{/{mapStatus}/}</span>\
            </div>',
            scope:{
                color:'@color',
                year:'@year',
                variable:'@variable',
                splits:'=splits'
            },
            link:function(scope,element,attrs){
                var map,projObject,layer,infoPop;
                var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
                var googleProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
                var usProjection   = new OpenLayers.Projection("EPSG:U4M"); // to
                var data={type:"FeatureCollection", features:[]};
                var citiesFt=[], cityCenterLayer,citiesLayer,markersLayer,cityMarker;
                var highlightCtrl,selectCtrl,transfCtrl=null;
                var self=this;
                var mapserver='http://demo-maps.aboutplace.co/heat';
                //var mapserver='http://geo.urban4m.com/heat';
                var hoveredCity=-1;
                var select = function(e) {
                        if(!e.layer)
                            return;
                        if(e.attributes.scaled){
                            e.attributes.zIndex=1;
                            e.attributes.scaled=false;
                        }
                         

                         if(infoPop)
                             map.removePopup(infoPop);
                         
                         if(hoveredCity>=0){
                             if(e.geometry.bounds.centerLonLat){
                                infoPop=new OpenLayers.Popup.Anchored("Details",
                                e.geometry.bounds.centerLonLat,
                                new OpenLayers.Size(200,200),
                                "Maybe something you would like to put here",null,
                                true);
                                infoPop.panMapIfOutOfView=false;
                                //infoPop.keepInMap=true;
                                map.addPopup(infoPop);
                            }
                         }
                         hoveredCity=-1;
                        
                       e.attributes.selected=true;
                       e.layer.redraw();
                    };
                    
                   var unselect = function(e,skipapply) {
                       if(!e.layer)
                            return;
                       e.attributes.selected=false;
                       if(infoPop)
                             map.removePopup(infoPop);
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
                        
                        
                        
                       hoveredCity=e.attributes.id*1;
                      
                          highlightCtrl.highlight(e);
                    };
                    
                    var unhover = function(e,skipapply) {
                        if(!e.layer)
                            return;
                        if(cityMarker){
                            citiesLayer.removeFeatures([cityMarker]);
                            cityMarker.destroy();
                            cityMarker=null;
                        }
                       hoveredCity=-1;

                         if(!e.attributes.selected)
                            highlightCtrl.unhighlight(e);
                        else {
                            e.renderIntent='select';
                            e.layer.redraw();
                        }
                       
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
                        var data={};
                        if(typeof arr =="object" && arr.features)
                            data=arr
                        else{
                            data.features=[];
                            arr=arr.length?arr:arr.cities;
                            for(var i=0;i<arr.length;i++){
                                var feat={"type":"Feature","properties":{id:arr[i].gid,name:arr[i].name},geometry:arr[i].shape};
                                data.features.push(feat);
                            }
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
                    //citiesLayer.isBaseLayer=true;
                    map.addLayer(citiesLayer);
                    //map.riseLayer(citiesLayer,5);

                    
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
                        multiple:false,
                        box:false,
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
                  
                  
                  
                  citiesFt=new OpenLayers.Format.GeoJSON({internalProjection:googleProjection,externalProjection:fromProjection}).read(data);
                  //map.zoomTo(0);
                   citiesLayer.events.register('featuresadded',citiesLayer,function(){
                    citiesLayer.setZIndex( 2 ); 
                    var bounds=citiesLayer.getDataExtent();
                    var z=Math.floor(map.getZoomForExtent(bounds));
                     //z-=0.1;
                     

                    map.zoomTo(z);
                        map.panTo(bounds.getCenterLonLat());
                        map.raiseLayer(citiesLayer,5);
                    //z=Math.floor(z);
                   
                    //map.zoomToExtent(bounds);
                        $rootScope.$$childHead.status='';
                        $rootScope.$$childHead.$apply();
                        
                        restyle();
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
                    label:'${sch_name}',
                    labelXOffset: 5,
                    labelAlign:'lm',
                    graphic:true,
                    pointRadius:20,
                    graphicName:"circle",
                    graphicZIndex:10,
                    fillOpacity:0.5

            };
            
            var temp = {
                fillColor:'#CCC',
                    strokeColor:"#FFFFFF",
                    
                    strokeWidth:"1.5",
                   fillOpacity:'${opacity}'

            };
            
            var style0 = new OpenLayers.Style(template, {context: context}); 
            
            var style1 = new OpenLayers.Style(temp, {context: context}); 
            
            var style=new OpenLayers.StyleMap({
                "default": style1,
                /*"select": new OpenLayers.Style({
                    zIndex:4,
                    fillColor:"#666"
                }),*/
                "select":style1,
                "temporary":style0
            }); 
            this.ApplyGeoJson(data,citiesFt,citiesLayer,style,'Cities');
        };
  
                
        function drawMap(){
            
            var mapOpt={
                minScale:50,
                maxScale:100000000000000,
                units: "m",
                projection:googleProjection,
                displayProjection: fromProjection,
                allOverlays:false,
                center:miamiCenter=new OpenLayers.LonLat(-80.26, 25.81).transform(fromProjection,googleProjection),
                
                controls:[
                    new OpenLayers.Control.Navigation(),
                    new OpenLayers.Control.Zoom(),
                    //new OpenLayers.Control.MousePosition()
                    /*new OpenLayers.Control.PanZoomBar(),
                    new OpenLayers.Control.LayerSwitcher()*/
                ]
            };

            map = new OpenLayers.Map($(element).find('#map')[0], mapOpt);
            layer=new OpenLayers.Layer.OSM('U4M',[
                    mapserver+"/${z}/${x}/${y}.png"
                    
                    ],{
                        isBaseLayer:true,
                        tileOptions: {crossOriginKeyword: null},
                        transitionEffect: 'resize'
                    });
                     
          /* layer = new OpenLayers.Layer.WMS( "OpenLayers WMS", 
                    "http://vmap0.tiles.osgeo.org/wms/vmap0",
                    {layers: 'basic'} );  */
            
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
                    });
                    
                    var point = new OpenLayers.Geometry.Point(0, 0);
                            cityMarker = new OpenLayers.Feature.Vector(point/*,null,style_blue*/); 
                            cityCenterLayer.addFeatures([cityMarker]);
                    map.addLayers([layer,cityCenterLayer]);

                    
                    
            
    }
        scope.$watch(function(){return attrs.url},function(newval, oldval){
            /*if(!scope.msa)
                return false;*/
            resize();
            if(!newval || !newval.length || newval.match(/null|undefined/i))
                return;
        
            getData(newval);
    
         });
    
         
         scope.$watch(function(){return scope.year+'_'+scope.variable;},function(){
             if(!citiesLayer)
                 return;
             restyle();

         });
         
    
         function restyle(){
                          citiesLayer.styleMap.styles.default.defaultStyle.fillColor=scope.color;
             for(var i=0;i<citiesFt.length;i++){
                 (function (Ft,idx){
                     var ft=Ft;
                     ft.attributes.opacity=ft.attributes[scope.variable+"_"+scope.year.substr(2,2)]?(((+ft.attributes[scope.variable+"_"+scope.year.substr(2,2)])-(+scope.splits[0]))/((+scope.splits[scope.splits.length-1])-(+scope.splits[0]))):0;
                     var l_idx=idx;
                     $timeout(function(){
                         citiesLayer.drawFeature(ft);
                     }
                 ,l_idx*10);
                     
                 })(citiesFt[i],i);
                 
             }
         }
    
        drawMap();
        map.zoomTo(9);
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
    .directive('mainMap',['$timeout','$location','$rootScope','$http',function($timeout,$location,$rootScope,$http){
        return{
            restrict:'C',
            replace:false,
            scope:{

                variable:'@variable',
                center:'=center',
                eduUrl:'@eduUrl',
                crimeUrl:'@crimeUrl'
                
            },
            template:'<div style="width:100%; height:100%" id="main-map"></div>',
            link:function(scope,element,attrs){
                var map,marker,markersLayer,projObject,infoPop;
                var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
                var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
                var markersSpotArr=[];
                var zoomControl=new OpenLayers.Control.Zoom();
                var miamiCenter;
                var data={type:"FeatureCollection", features:[]};
                var citiesFt={elems:[]},crimeBlks={elems:[]}, crimeLayer,citiesLayer,markersLayer,cityMarker;
                var highlightCtrl,selectCtrl,transfCtrl=null;
                var self=this;
                
                
                var areas=[
                    {
                        name:"Area with Lower Educational Performance",
                        center:[-80.2299083838254, 25.8212930357779],
                        variables:{
                            "crime":9.4,
                            "1377":6.6,
                            "1455":4.0, 
                            "1373": 2.4
                        }
                    },
                    {
                        name:"Area with Higher Educational Performance",
                        center:[-80.379265387658, 25.7703491262735],
                        variables:{
                            "crime":1.5,
                            "1377":1.9,
                            "1455":1.4, 
                            "1373": 3.6
                        }
                    }
            ]
                
                
                //var usProjection   = new OpenLayers.Projection("EPSG:U4M");
                var mapserver='http://demo-maps.aboutplace.co/';
                //var mapserver='http://geo.urban4m.com/';
                var strTFS,prtTFS=null;

                                
                var Stage1Bounds;
                var url='';
                var TMSLayer=GeoLayer=null;
                var nLayer;
                var min_zoom=0,
                    max_zoom=20;
                
                var select = function(e) {
                        if(!e.layer)
                            return;
                        if(e.attributes.scaled){
                            e.attributes.zIndex=1;
                            e.attributes.scaled=false;
                        }
                         

                         if(infoPop)
                             map.removePopup(infoPop);

                        
                       e.attributes.selected=true;
                       e.layer.drawFeature(e);
                    };
                    
                   var unselect = function(e,skipapply) {
                       if(!e.layer)
                            return;
                       e.attributes.selected=false;
                       if(infoPop)
                             map.removePopup(infoPop);
                    };
                    
                    var hover = function(e,skipapply) {
                        if(!e.layer)
                            return;
                                           
                          highlightCtrl.highlight(e);
                    };
                    
                    var unhover = function(e,skipapply) {
                        if(!e.layer)
                            return;
                     

                         if(!e.attributes.selected)
                            highlightCtrl.unhighlight(e);
                        else {
                            e.renderIntent='select';
                            e.layer.drawFeature(e);
                        }
                       
                    };
                
                
                
                function getData(url,fn){
                    /*AddCities([]);
                    return;*/
                    var lfn=fn;
                    $http.get(url).success(function(arr){
                        var data={};
                        if(typeof arr =="object" && arr.features)
                            data=arr
                        else{
                            data.features=[];
                            arr=arr.length?arr:arr.cities;
                            for(var i=0;i<arr.length;i++){
                                var feat={"type":"Feature","properties":{id:arr[i].gid,name:arr[i].name},geometry:arr[i].shape};
                                data.features.push(feat);
                            }
                        }
                        if(lfn && angular.isFunction(lfn))
                            fn(data);
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
                        label:'${sch_name}',
                        labelXOffset: 5,
                        labelAlign:'lm',
                        graphic:true,
                        pointRadius:20,
                        graphicName:"circle",
                        graphicZIndex:10,
                        fillOpacity:0.5
                    };
            
                    var temp = {
                        fillColor:'transparent',
                        strokeColor:"#FFFFFF",
                        strokeWidth:"1.5",
                       fillOpacity:'${opacity}'
                    };
            
                    var style0 = new OpenLayers.Style(template, {context: context}); 
            
                    var style1 = new OpenLayers.Style(temp, {context: context}); 
            
                    var style=new OpenLayers.StyleMap({
                        "default": style1,
                        "select":style1,
                        "temporary":style0
                    }); 
                    
                    
                    if(citiesFt.elems){
                        for(var i=0;i<citiesFt.elems.length;i++)
                            citiesFt.elems[i].destroy();
                    }
                 
                    citiesFt={elems:[]};

                
                    if(citiesLayer){
                        map.removeLayer(citiesLayer);
                        citiesLayer.destroy();
                        citiesLayer=null;
                    }
                    
                    citiesLayer = new OpenLayers.Layer.Vector(name,{
                            styleMap: style,
                            visibility:(scope.variable==='edu'),
                            rendererOptions:{zIndexig:true}
                    });
                    
                    
                    this.ApplyGeoJson(data,citiesFt,citiesLayer,style,'Cities');
                };
                
                this.AddCrime=function(data){

            
                    var context = {
                        getOpacity: function(f) {
                            return f.attributes.totcrime/199;
                        }
                    }
                    var template = {
                        fillOpacity:0.5
                    };
            
                    var temp = {
                        fillColor:'red',
                        strokeColor:"#FFFFFF",
                        strokeWidth:"1.5",
                       fillOpacity:'${getOpacity}'
                    };
            
                    var style0 = new OpenLayers.Style(template, {context: context}); 
            
                    var style1 = new OpenLayers.Style(temp, {context: context}); 
            
                    var style=new OpenLayers.StyleMap({
                        "default": style1,
                        "select":style1,
                        "temporary":style0
                    }); 
                    
                    
                    if(crimeBlks.elems){
                        for(var i=0;i<crimeBlks.elems.length;i++)
                            crimeBlks.elems[i].destroy();
                    }
                 
                    crimeBlks.elems=[];

                
                    if(crimeLayer){
                        map.removeLayer(crimeLayer);
                        crimeLayer.destroy();
                        crimeLayer=null;
                    }
                    
                    crimeLayer = new OpenLayers.Layer.Vector('Crime',{
                            styleMap: style,
                            visibility:(scope.variable==='crime'),
                            rendererOptions:{zIndexig:true}
                    });
                    
                    
                    this.ApplyGeoJson(data,crimeBlks,crimeLayer,style,'Crime');
                };
                
                
                this.ApplyGeoJson=function(data,features,layer,style,name){
                 
                        
                 if(highlightCtrl){
                        highlightCtrl.deactivate();
                        selectCtrl.deactivate(); 
                        map.removeControl(highlightCtrl);
                        map.removeControl(selectCtrl);
                        highlightCtrl.destroy();
                        selectCtrl.destroy(); 
                        highlightCtrl=selectCtrl=transfCtrl=null; 
                   }
                    
                    
                    
                    var myStyles = style;
                    
                    //citiesLayer.isBaseLayer=true;
                    map.addLayer(layer);
                    //map.riseLayer(citiesLayer,5);
                    map.raiseLayer(markersLayer,5);

                    
                    highlightCtrl = new OpenLayers.Control.SelectFeature(layer, {
                        hover: true,
                        multiple:false,
                        highlightOnly: true,
                        renderIntent: "temporary",
                        overFeature: hover,
                        outFeature:unhover
                   });


                   selectCtrl = new OpenLayers.Control.SelectFeature(layer,{
                        clickout:false,
                        toggle:true,
                        multiple:false,
                        box:false,
                        onSelect: select,
                        onUnselect: unselect
                  });
                  map.addControl(highlightCtrl);
                  map.addControl(selectCtrl);
                  highlightCtrl.activate();
                  selectCtrl.activate(); 
                  
                  
                  
                  features.elems=new OpenLayers.Format.GeoJSON({internalProjection:toProjection,externalProjection:fromProjection}).read(data);
                  //map.zoomTo(0);
                   layer.events.register('featuresadded',layer,function(){
                    /*layer.setZIndex( 2 ); 
                    var bounds=layer.getDataExtent();
                    var z=Math.floor(map.getZoomForExtent(bounds));
                     //z-=0.1;
                     

                    map.zoomTo(z);
                        map.panTo(bounds.getCenterLonLat());
                        map.raiseLayer(layer,5);
                    //z=Math.floor(z);
                   
                    //map.zoomToExtent(bounds);
                        $rootScope.$$childHead.status='';
                        $rootScope.$$childHead.$apply();
                        */
                        restyle();
                   })
                if(features.elems)
                    layer.addFeatures(features.elems); 
                else
                  features.elems=[];
                  //citiesLayer.isBaseLayer=true;
                  
                 
            }
           
                
                var placeMarker=function (ltln,icon,text,clase) {
                    var size = new OpenLayers.Size(60,65);
                    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
                    var tclase='pulse-marker';
                    if(clase && clase.length)
                        tclase+=" "+clase
                    var  marker_icon = new OpenLayers.Icon(icon||'http://www.openlayers.org/dev/img/marker.png', size, offset,null,text+'',tclase);
       
                    var marker=new OpenLayers.Marker(ltln,marker_icon,text);
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
                
                function AddSpot(lnlt,text,clase){
                    markersSpotArr.push(placeMarker(lnlt,"img/pointers/pointer_3_1.png",text,clase));
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
                    center:miamiCenter=new OpenLayers.LonLat(-80.26, 25.81).transform(fromProjection,toProjection),
                    displayProjection: fromProjection,
                    units: "m",
                    /*maxResolution: 156543.0339,
                    maxExtent: new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34) ,*/
                    controls:[
                        new OpenLayers.Control.Navigation({'zoomWheelEnabled':true}),
                        /* new OpenLayers.Control.CacheRead(),
                         new OpenLayers.Control.CacheWrite({
                            autoActivate: true,
                            imageFormat: "image/png",
                            eventListeners: {
                                cachefull: function() { }
                            }
                        })*/
                        new OpenLayers.Control.Zoom(),
                        new OpenLayers.Control.MousePosition()
                       //new OpenLayers.Control.PanZoomBar(),
                        //new OpenLayers.Control.LayerSwitcher()
                    ]
                };


                map = new OpenLayers.Map($(element).find('#main-map')[0], mapOpt);
                nLayer=new OpenLayers.Layer.OSM('U4M',[
                    mapserver+"heat/${z}/${x}/${y}.png"
                    
                    ],{
                        isBaseLayer:true,
                        tileOptions: {crossOriginKeyword: null},
                        transitionEffect: 'resize'
                    });
                     
                    map.addLayer(nLayer); 



                markersLayer=new OpenLayers.Layer.Markers( "Markers" );
                map.addLayer(markersLayer);
                map.raiseLayer(markersLayer,5);
                
                /*
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
               */ 
            Stage1Bounds=new OpenLayers.Bounds(-150,24,-67,49).transform(
                    fromProjection,
                    map.getProjectionObject());
                    
           miamiCenter=new OpenLayers.LonLat(-80.26, 25.81).transform(
                    fromProjection,
                    map.getProjectionObject()
                )
                    
                    
                    map.events.register("zoomend",map,function(){
                        ApplyCluster();
                    })
                
}

    
    drawMap();
  
    map.zoomTo(11);
    function ApplyCluster(){
        if(!markersSpotArr.length)
            return;
         var clustersArr=[
                       [
                           {
                               idx:0,
                               marker:markersSpotArr[0]
                           }
                       ]
                   ];
                   $(".pulse-marker").removeClass (function (index, css) {
                            var arr=css.split(" ");
                            var clases='';
                            for(var i=0;i<arr.length;i++){
                                if(arr[i].match(/cluster/g))
                                    clases+=arr[i];
                            }
                        return clases;
                    });
                   
                   for(var i=1;i<markersSpotArr.length;i++){
                       var matched=false;
                       var point=markersLayer.getViewPortPxFromLonLat(markersSpotArr[i].lonlat);
                       //new OpenLayers.Geometry.Point(markersSpotArr[i].lonlat.lon,markersSpotArr[i].lonlat.lat);
                       for(var j=0;j<clustersArr.length;j++){
                           //if(point.distanceTo(new OpenLayers.Geometry.Point(clustersArr[j][0].marker.lonlat.lon,clustersArr[j][0].marker.lonlat.lat))<120000){
                           if(point.distanceTo(markersLayer.getViewPortPxFromLonLat(clustersArr[j][0].marker.lonlat))<60){
                               clustersArr[j].push({marker:markersSpotArr[i], idx:i});
                               matched=true;
                               break;
                           }
                       }
                       if(!matched){
                           clustersArr.push([
                                {
                                    idx:i,
                                    marker:markersSpotArr[i]
                                }
                            ])
                       }
                   }
                   
                   for(var k=0;k<clustersArr.length;k++){
                         var len=clustersArr[k].length;
                         var alpha=360/(len+2);
                         var beta=alpha/2;
                         var hip=20/Math.sin(beta);
                         var c=markersLayer.getViewPortPxFromLonLat(clustersArr[k][0].marker.lonlat);
                         
                         for(var l=0; l<len;l++){
                             var marker=clustersArr[k][l];
                            
                             if(len<5){
                                  $('.marker_'+marker.idx).addClass("cluster_"+len+"_"+l);
                                 marker.marker.icon.setUrl('img/pointers/pointer_'+len+'_'+l+'.png');
                             }
                             else{
                                  $('.marker_'+marker.idx).addClass("cluster_gt_4");
                                 marker.marker.icon.setUrl('img/pointers/big_cluster.png');
                                 var px={x:0,y:0};
                                 
                                 
                                 px.x=c.x+10+hip*Math.cos(l*alpha);
                                 px.y=c.y+40+hip*Math.sin(l*alpha);
                                 /*px.x-=20;
                                 px.y-=20;*/
                                 marker.marker.icon.moveTo(px);
                             }
                         }
                     }
    }
    
    scope.$watch('variable',function(val){
        for(var i=0;i<markersSpotArr.length;i++){
            deleteMarker(markersSpotArr[i]);
        }
        markersSpotArr=[];
        if(citiesLayer)
            citiesLayer.setVisibility(false);
        if(crimeLayer)
            crimeLayer.setVisibility(false);
        if(val!=='crime' && val!=='edu'){
            nLayer.url=[mapserver+scope.variable+"/${z}/${x}/${y}.png"];
            nLayer.redraw();
        }
        else if(val==='crime' && crimeLayer)
            crimeLayer.setVisibility(true);
        else if(val==='edu' && citiesLayer)
            citiesLayer.setVisibility(true);
        
        if(areas[0].variables[val]){
            AddSpot(new OpenLayers.LonLat(areas[0].center[0],areas[0].center[1]).transform(fromProjection,toProjection),areas[0].variables[val],"marker_"+markersSpotArr.length);
            AddSpot(new OpenLayers.LonLat(areas[1].center[0],areas[1].center[1]).transform(fromProjection,toProjection),areas[1].variables[val],"marker_"+markersSpotArr.length);
        }
        ApplyCluster();
        
    });  
    
   
    
    scope.$watch('center',function(){
        if(scope.center && angular.isArray(scope.center) && scope.center.length===2){
            map.zoomTo(14);
            map.panTo(new OpenLayers.LonLat(scope.center[0], scope.center[1]).transform(fromProjection,map.getProjectionObject()) );
        }
    })
    
    scope.$on('collapse',function($event,id){
         if(infoPop)
            map.removePopup(infoPop);
   })
    
    
    scope.$watch('eduUrl',function(newval, oldval){
            resize();
            if(!newval || !newval.length || newval.match(/null|undefined/i))
                return;
        
            getData(newval,self.AddCities);
    
    });
    
    scope.$watch('crimeUrl',function(newval, oldval){
            resize();
            if(!newval || !newval.length || newval.match(/null|undefined/i))
                return;
        
            getData(newval,self.AddCrime);
    
    });
 
    function restyle(attr,color){
        if(!citiesLayer)
            return;
                          citiesLayer.styleMap.styles.default.defaultStyle.fillColor="#6666ff";
             for(var i=0;i<citiesFt.elems.length;i++){
                 (function (Ft,idx){
                     var ft=Ft;
                     ft.attributes.opacity=ft.attributes.grd3_11?(((+ft.attributes.grd3_11))/(100)):0;
                     var l_idx=idx;
                     $timeout(function(){
                         citiesLayer.drawFeature(ft);
                     }
                 ,l_idx*10);
                     
                 })(citiesFt.elems[i],i);
                 
             }
    }
    
    $timeout(function(){resize();},100);
    
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
                       
                        if(isNumber(attrs.widthAdjust))
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
                        $timeout(function(){
                            update();
                        },20);
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
    .directive('barChart',['$timeout','$location','$rootScope',function($timeout,$location,$rootScope){
        return{
            restrict:'C',
            replace:false,
            scope:{
                data:'=data',
                color:'=color',
                xsplits:'=xsplits',
                ydomain:'=ydomain',
                title:'=title',
                xAxis:'@xaxis',
                yAxis:'@yaxis'
                
            },
            link:function(scope,element,attrs){
             var xsplits=scope.xsplits;  
// Generate an Irwin–Hall distribution of 10 random variables.
var values = [];

// A formatter for counts.
var formatCount = d3.format(",.2f");
var margin = {top: 30, right: 30, bottom: 50, left: 50},
    width = $(element).width() - margin.left - margin.right,
    height =element.height() - margin.top - margin.bottom;
var column_width=Math.floor((width)/(xsplits.length-1));
var x = d3.scale.linear()
    .domain([xsplits[0],xsplits[xsplits.length-1]])
    .range([0, width]);


var data = d3.layout.histogram()
    .range([xsplits[0],xsplits[xsplits.length-1]])
    .bins(xsplits)
    (values);

var y = d3.scale.linear()
    .domain(scope.ydomain)
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom").tickValues(xsplits).tickFormat(formatCount);
    
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
var elem=$(element).get()[0];
var svg = d3.select(elem).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var bar = svg.selectAll(".bar")
    .data(data)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width",column_width-1)
    .attr("height", function(d) { return height - y(d.y); })
    .style("fill",scope.color);

bar.append("text")
    .attr("dy", ".75em")
    .attr("y", -10)
    .attr("x", column_width / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.y); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
     .append("text")
      .attr("class","axis_labels")
      .attr("transform","translate(20,25)")
      .attr("width", width)
      .attr("dy", ".71em")
      //.style("text-anchor", "end")
      .text(scope.xAxis)  ;
      
    svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis)
    .append("text")
      .attr("class","axis_labels")
      .attr("transform", " rotate(-90) translate(-30,-50)")
      .attr("height", height)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(scope.yAxis);  
    
    scope.$watch('data',function(){
        update(scope.data||[]);
    })
    
    function update(values){
        data = d3.layout.histogram()
    .range([xsplits[0],xsplits[xsplits.length-1]])
    .bins(xsplits)
    (values);
    //y.domain([0, d3.max(data, function(d) { return d.y; })]);
    

    var time=800;
    var el=d3.select(elem);
    data=bins(values);
    
    
    var rec =el.selectAll('.bar rect').data(data).transition().duration(time)
    .delay(function(d,i){return time*i})
    .attr("height", function(d) { 
        return height - y(d.y); 
    })
    ;
    
        var rec =el.selectAll('.bar text').data(data).transition().duration(time)
        .delay(function(d,i){return time*i})
    .text(function(d) { return formatCount(d.y); });
    
    
         el.selectAll('.bar').data(data).transition().duration(time).delay(function(d,i){return time*i}).attr("transform", function(d) { 
        return "translate(" + x(d.x) + "," + y(d.y) + ")"; 
    });  
    
    /*yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    el.select('.y.axis').call(yAxis);*/
    
    function bins(dato){
        
        var res=[];
        for(var i=0;i<xsplits.length-1;i++){
            res.push([]);
            res[i].x=xsplits[i];
            res[i].dx=Math.abs(xsplits[i+1]-xsplits[i]);
            res[i].y=0;
        }
        
        for(var i=0;i<dato.length;i++){
            for(var j=0;j<res.length;j++){
                if((dato[i]-res[j].x)>0 && (dato[i]-res[j].x)<=res[j].dx){
                    res[j][res[j].y]=dato[i];
                    res[j].y++;
                    break;
                }
            }
        }
        
        return res;
    }
    
    }
            }
        };
    }]) 
    .directive('yearIndicator',['$timeout','$rootScope',function($timeout,$rootScope){
        return{
            restrict:'C',
            replace:false,
            scope:{
                data:'@value'
            },
            link:function(scope,element,attrs){
                scope.$watch('data',function(){
                    $(element).removeClass('swing');
                    $timeout(function(){$(element).addClass('swing');});
                })
            }
        };
    }])
;


function isNumber(n) {
return !isNaN(parseFloat(n)) && isFinite(n);
}