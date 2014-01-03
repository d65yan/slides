angular.module('Directives',['LocalServices'/*,'MapModule'*/])
    /*.directive('slider',function(){
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
    })*/
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
    /*.directive('expandableContent1',['$timeout',function($timeout){
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
    }])*/
    /*.directive('cityDetails',['$timeout','$location','$rootScope',function($timeout,$location,$rootScope){
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
    }])*/
    .directive('mainMap',['$timeout','SelectionService','GeograficService','$location','$rootScope',function($timeout,SelectionService,GeograficService,$location,$rootScope){
        return{
            restrict:'C',
            replace:false,
            scope:{

                stage:'@stage',
                msa:'@msa',
                area:'@area',
                lfs:'@lfs',
                center:'@center'
                
            },
            template:'<div style="width:100%; height:100%" id="main-map"><div class="custom_controls_bar"><button class="btn btn-success" ng-disabled="canDraw" ng-click="ToggleDraw()">paint</button><br><button class="btn btn-primary" ng-disabled="canDraw" ng-click="ToggleEdit()">Edit</button><br><button class="btn" ng-disabled="!canDraw" ng-click="CancelAll()">Done</button><br><button class="btn btn-danger" ng-disabled="canDraw || !hasFeatures" ng-click="ClearBoundaries()">Clear</button></div></div></div>',
            link:function(scope,element,attrs){
                var map,marker,markersLayer,projObject,infoPop;
                var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
                var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
                var markersSpotArr=[];
                var zoomControl=new OpenLayers.Control.Zoom();
                var lineLayer = new OpenLayers.Layer.Vector("Line Layer");
                 var strTFS,prtTFS=null;
                scope.hasFeatures=false;
                                      
                                 var out_options = {
                'internalProjection': toProjection,
                'externalProjection': fromProjection
            };
            
            var selLoc=false;
            var mrid=null;
            var mpid=null;
            var currentRegion=-1;
            var currentHeat=-1;
            var urls=[
                'http://demo-maps.aboutplace.co/1468',
                'http://demo-maps.aboutplace.co/1466',
                'http://demo-maps.aboutplace.co/1438',
                'http://demo-maps.aboutplace.co/1438z',
                'http://demo-maps.aboutplace.co/1455',
                'http://demo-maps.aboutplace.co/1373',
                'http://demo-maps.aboutplace.co/1377'
            ];
            
            
            var gjParser=new OpenLayers.Format.GeoJSON(out_options);
                
                var lineDrawer=new OpenLayers.Control.DrawFeature(lineLayer,
                        OpenLayers.Handler.Path,{
                            handlerOptions:{freehand:true,freehandToggle:null},
                            multi:true,
                            featureAdded:function(e){
                                var simp=e.geometry.components[0].getVertices();
                                var polygon= new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(e.geometry.components[0].simplify(700).getVertices())]));
                                
                                 
                                 console.log(gjParser.write(polygon,out_options));
                                
                                lineLayer.destroyFeatures();
                                lineLayer.addFeatures([polygon]);
                                scope.ToggleDraw();
                                scope.hasFeatures=true;
                                var phase = scope.$root.$$phase;
                
                                 if(phase != '$apply' && phase != '$digest')
                                    scope.$apply();
                                
                          }
                        });
                var poligonEdit= new OpenLayers.Control.ModifyFeature(lineLayer,{
                    createVertices:false,
                    onModificationEnd:function(ft){
                        scope.ToggleEdit(true);
                         console.log(gjParser.write(ft,out_options));
                        var phase = scope.$root.$$phase;
                
                                 if(phase != '$apply' && phase != '$digest')
                                    scope.$apply();
                    }
                });
                scope.canDraw=false;
                scope.drawTitle="Begin Drawing";
                
                scope.CancelAll=function() {
                    scope.ToggleDraw(true);
                    scope.ToggleEdit(true);
                }
                
                scope.ClearBoundaries=function(){
                    lineLayer.destroyFeatures();
                    scope.CancelAll();
                    scope.hasFeatures=false;
                }
                
                scope.ToggleDraw=function(force) {
                    lineDrawer.deactivate();
                    
                   scope.canDraw=!scope.canDraw && !force;
                   if(scope.canDraw)
                       lineDrawer.activate();
                }
                
               scope.ToggleEdit=function(force) {
                    poligonEdit.deactivate();
                    $('.line-drawing-layer').removeClass('edit');
                   scope.canDraw=!scope.canDraw && !force;
                   if(scope.canDraw){
                       poligonEdit.activate();
                       $('.line-drawing-layer').addClass('edit');
                   }
                }
                
                var miamiCenter;
                //var usProjection   = new OpenLayers.Projection("EPSG:U4M");
                var mapserver='http://demo-maps.aboutplace.co/heat';
                //var mapserver='http://geo.urban4m.com/heat';
                //var mapserver1='http://geo.urban4m.com/poly/';
                var strTFS,prtTFS=null;
                var geo=GeograficService;
                var select=SelectionService;

                                
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
                   //strTFS.url=mapserver1+partq;
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
                
                var placeMarker=function (ltln,icon,text,clase) {
                    var size = new OpenLayers.Size(62,62);
                    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
                    var tclase='pulse-marker';
                    if(clase && clase.length)
                        tclase+=" "+clase
                    var  marker_icon = new OpenLayers.Icon(icon||'http://www.openlayers.org/dev/img/marker.png', size, offset,null,text+'',tclase,null,null,true);
       
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
                    var mark=placeMarker(lnlt,"img/pointers/pointer_3_1.png",(text||'?.?'),clase)
                    markersSpotArr.push(mark);
                    return mark;
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
                    fractionalZoom:false,
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
                        new OpenLayers.Control.Zoom(),
                        lineDrawer,
                        poligonEdit
                        //new OpenLayers.Control.MousePosition()
                       //new OpenLayers.Control.PanZoomBar(),
                        //new OpenLayers.Control.LayerSwitcher()
                    ]
                };


                /*strTFS = new OpenLayers.Strategy.TFS({resFactor: 1,ratio:1,format: new OpenLayers.Format.GeoJSON()});
		prtTFS = new OpenLayers.Protocol.TFS({ url: "./php/TFS.php",last:false,
								format: new OpenLayers.Format.GeoJSON()  });*/

			

                map = new OpenLayers.Map($(element).find('#main-map')[0], mapOpt);
                nLayer=new OpenLayers.Layer.OSM('U4M',[
                    mapserver+"/${z}/${x}/${y}.png?"+select.map_query
                    
                    ],{
                        isBaseLayer:true,
                        tileOptions: {crossOriginKeyword: null},
                        transitionEffect: 'resize'
                    });
                     
               nLayer.events.register('loadend',nLayer,function(){
                   var node=document.getElementById(lineLayer.id);
                    if(node){
                         var clase=node.className.split(' ');
                         node.className=clase+" line-drawing-layer";
                    }
                       
                })
                

		scope.UpdateUrl('');
                /*$timeout(function(){
                  var layer = new OpenLayers.Layer.Vector("Line",{
						        strategies: [strTFS],
						         protocol:prtTFS,
					 			projection: new OpenLayers.Projection("EPSG:4326"),
							});
                    map.addLayer(layer);
                scope.UpdateUrl('');
                },100)*/
                nLayer.events.register('moveend',nLayer,function(){
                    var bound=map.getExtent().transform(toProjection,fromProjection);
                    var lbound={bottom:bound.bottom, left:bound.left,top:bound.top,right:bound.right};
                   $rootScope.$broadcast('boundboxChanged',lbound);
                     console.log(lbound);  
                })
                     
                    map.addLayer(nLayer); 
                    map.addLayer(lineLayer); 

                    
                    //lineDrawer.activate();
                    

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
                        //console.log(map.getExtent().transform(map.projectionObject,fromProjection));
                    })
                    

                
}

    
    drawMap();
    map.zoomToExtent(Stage1Bounds,true);
    map.zoomToProxy = map.zoomTo;
    map.zoomTo =  function (zoom,xy){
        /*if(scope.zooming)
            return;
        scope.zooming=true;*/
            
        if(zoom<min_zoom)
            zoom=min_zoom;
        else if(zoom>max_zoom)
            zoom=max_zoom;
        
        var dest=zoom;
        function zoomify(){
            var czoom=map.getZoom();
            if(map.zoom==dest){
                
                scope.zooming=false;
                return;
            }
            var delta=(dest-czoom)/Math.abs(dest-czoom);
            $timeout(zoomify,700);
            map.zoomToProxy(czoom+delta,xy);
        }
        //zoomify();
        map.zoomToProxy(zoom);
         
    };

    function ApplyCluster(){
        if(!markersSpotArr.length)
            return;
         var clustersArr=[
                       
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
                   
                   for(var i=0;i<markersSpotArr.length;i++){
                       var matched=false;
                       
                       var point=markersSpotArr[i]?markersLayer.getViewPortPxFromLonLat(markersSpotArr[i].lonlat):null;
                       var llnlt=markersSpotArr[i].lonlat;
                       //new OpenLayers.Geometry.Point(markersSpotArr[i].lonlat.lon,markersSpotArr[i].lonlat.lat);
                       for(var j=0;j<clustersArr.length;j++){
                           //if(point.distanceTo(new OpenLayers.Geometry.Point(clustersArr[j][0].marker.lonlat.lon,clustersArr[j][0].marker.lonlat.lat))<120000){
                           if(point && point.distanceTo(markersLayer.getViewPortPxFromLonLat(clustersArr[j].center))<60){
                               clustersArr[j].markers.push({marker:markersSpotArr[i], idx:i});
                               clustersArr[j].bounds.extend(llnlt);
                               clustersArr[j].center=clustersArr[j].bounds.getCenterLonLat()
                               matched=true;
                               break;
                           }
                       }
                       if(!matched && point){
                           var lbounds= new OpenLayers.Bounds();
                           lbounds.extend(llnlt);
                           clustersArr.push({
                               bounds:lbounds,
                               center:llnlt,
                                markers:[
                                    {
                                        idx:i,
                                        marker:markersSpotArr[i]
                                    }
                                ]
                            })
                       }
                   }
                   
                   for(var k=0;k<clustersArr.length;k++){
                         var len=clustersArr[k].markers.length;
                         var alpha=360/(len+2);
                         var beta=alpha/2;
                         var hip=20/Math.sin(beta);
                         var c=markersLayer.getViewPortPxFromLonLat(clustersArr[k].center);
                         clustersArr[k].markers.sort(function(a,b){
                             return (a.marker.lonlat.lon-b.marker.lonlat.lon)/Math.abs(a.marker.lonlat.lon-b.marker.lonlat.lon)
                         })
                         
                         for( l=1, llen=clustersArr[k].markers.length-1; l<llen; l++){
                             if(clustersArr[k].markers[l].marker.lonlat.lat>clustersArr[k].center.lat){
                                 clustersArr[k].markers.push(clustersArr[k].markers.splice(l,1)[0]);
                                 llen--;
                             }
                         }
                         
                         for(var l=0; l<len;l++){
                             var marker=clustersArr[k].markers[l];
                            
                            var angles=[
                                [0],
                                [-45,45],
                                [-90,0,90],
                                [-90,0,90,180]
                            ]
                            
                            
                             if(len<5){
                                  $('.marker_'+marker.idx).addClass("cluster_"+len+"_"+l);
                                  $('.marker_'+marker.idx+' svg>g').attr('transform','translate(8,2) rotate('+angles[len-1][l]+',23,29)')
                                // marker.marker.icon.setUrl('img/pointers/pointer_'+len+'_'+l+'.png');
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
    
   

        scope.$watch('stage',function(nv, ov){
           
       
        $timeout(function(){
                
        
        if(+nv===3){
            clearAnims();
            min_zoom=6;
            max_zoom=14;
           //map.setCenter(miamiCenter,12);
            map.addControl(zoomControl);
            map.zoomTo(12);
        }
        else{ 
             for(var i=0;i< markersSpotArr.length;i++){
                    deleteMarker(markersSpotArr[i]);
            }
            $(".pulse-marker").off('click');
            markersSpotArr=[];
            map.removeControl(zoomControl);
            if(+nv===1){
                min_zoom=4;
                max_zoom=14;
                var zoom=map.getZoomForExtent(Stage1Bounds);
               map.zoomTo(Math.round(zoom));
               var h1=Stage1Bounds.getCenterLonLat();
               map.setCenter(h1);
               //$timeout(panMap,400);
               
                  
               
           }
        }
        });
    });
    
    function panMap(){
        if(selLoc){
            $timeout.cancel(mpid);
            return;
        }
        currentRegion=generateRandom(currentRegion,geo.regions.length-1);
        
        var loc={
            location:{
                long:geo.regions[currentRegion].location.long,
                lat:geo.regions[currentRegion].location.lat
            }
        }
        
        m2loc(loc);
        
        mpid=$timeout(panMap,11000);
    }
    
   function rotateMap(){

        currentHeat=generateRandom(currentHeat,6);
        
        nLayer.url=[urls[currentHeat]+"/${z}/${x}/${y}.png"];
            nLayer.redraw();
        
        mrid=$timeout(rotateMap,7000);
    }
    
    function generateRandom(num,max){
        
        var nnum=Math.floor(Math.random()*(max+1));
        nnum=nnum>max?max:nnum;
        nnum=nnum!=num?nnum:generateRandom(num,max);
        return nnum;        
    }
    
    function clearAnims(){
         $timeout.cancel(mpid);
         mpid=null;
          $timeout.cancel(mrid);
          mrid=null;
    }
    
    
   /*scope.$watch('area',function(){
         if(!scope.area || !scope.area.length || +scope.area<0)
           return;
       var center=geo.GetregionAreaCenterById(+scope.area);
       var nCenter=new OpenLayers.LonLat(center.lon, center.lat).transform(fromProjection,map.getProjectionObject());
       map.setCenter(nCenter);
    });*/
    
    
    
    /*scope.$watch('lfs',function(){
        if(scope.stage>1)
            return;
        $(".pulse-marker").off('click');
         for(var i=0;i< markersSpotArr.length;i++){
                    deleteMarker(markersSpotArr[i]);
        }
        markersSpotArr=[];
               for(var i=0;i<geo.pulses.length;i++){
                   for(var j=0;j<geo.pulses[i].children.length;j++)
                        AddSpot(new OpenLayers.LonLat(geo.pulses[i].children[j].center.lon,geo.pulses[i].children[j].center.lat).transform(fromProjection, map.getProjectionObject()),geo.pulses[i].children[j].pulses[scope.lfs],"marker_"+markersSpotArr.length+" "+"area_"+geo.pulses[i].children[j].gid);
               }
               
       $timeout(function(){
                  ApplyCluster();
                   
       });
        $(".pulse-marker").on('click',function(){
                   var area=geo.GetRegionAreaById(null, +this.className.split(' ')[2].split('_')[1]);
                   var idx=+this.className.split(' ')[1].split('_')[1];
                     $("#gotoArea").off('click');  
                 if(infoPop)
                      map.removePopup(infoPop);
                 infoPop=new OpenLayers.Popup.Anchored("city_detail",
                 markersSpotArr[idx].lonlat,
                 new OpenLayers.Size(200,200),
                 'BLA BLA BLA '+area.name+' <br/><button class="btn" id="gotoArea">go</button>',
                 null,
                 true);
                 infoPop.panMapIfOutOfView=true;
                 //infoPop.keepInMap=true;
                  map.addPopup(infoPop);
                  $('#gotoArea').on('click',function(){
                      map.removePopup(infoPop);
                      $location.search('c',area.id);
                      scope.$apply();
                  })
                         
                   
               });
    })*/
    

        
   scope.$on('ForceUpdate',function(){
        
        
        updateMap();
       
    }); 
    
    scope.$on('selectedSystemsChanged',function(){
        
        
        updateMap();
       
    });  
    
    
    function updateMap(){
      currentHeat=generateRandom(currentHeat,6);
        mapserver=urls[currentHeat];
        
            nLayer.url=[mapserver+"/${z}/${x}/${y}.png?"+select.map_query];
            nLayer.redraw();  
    }
    
    scope.$on('collapse',function($event,id){
         if(infoPop)
            map.removePopup(infoPop);
   })
    
    scope.$on('PlacesReceived',function($event,spots){
        $(".pulse-marker").off('click');
        for(var i=0;i< markersSpotArr.length;i++){
                    deleteMarker(markersSpotArr[i]);
        }
        markersSpotArr=[];
        for(var i=0;i<spots.length;i++){
            if(spots[i].center){
                var mark=AddSpot(new OpenLayers.LonLat(spots[i].center.lon,spots[i].center.lat).transform(fromProjection, map.getProjectionObject()),spots[i].pulse,"marker_"+i);
                (function attach(marker,spot){
                   marker.events.register("click", marker, function(){
                        $rootScope.$broadcast('hotSpotClicked',spot.gid);
                    }); 
                })(mark,spots[i])
                
            }
        }
        
        
        
       /*  $(".pulse-marker").on('click',function(){
             event.stopPropagation();
             event.preventDefault();
             
             var cname=$.trim(this.className);
              var idx=+cname.split(' ')[1].split('_')[1];
              $rootScope.$broadcast('hotSpotClicked',idx);
              return;
                 if(infoPop)
                      map.removePopup(infoPop);
                 infoPop=new OpenLayers.Popup.Anchored("city_detail",
                 markersSpotArr[idx].lonlat,
                 new OpenLayers.Size(200,200),
                 'BLA BLA BLA <br/>SCORE CARD',
                 null,
                 true);
                 infoPop.panMapIfOutOfView=true;
                 //infoPop.keepInMap=true;
                  map.addPopup(infoPop);
               });*/
        
        
        
        ApplyCluster()
        
    })
    
    scope.$on('locationChange',function($event,location){
          m2loc(location);
        
    })
    
    scope.$on('addressSelected',function($event,location){
            if(scope.stage<3){
                m2loc(location);
               /* if(!mrid)
                    $timeout(rotateMap,400);*/
            }
            selLoc=true;
            
        
    });
    
    function m2loc(location,zoom){
        if(location.location && location.location.long){
            var llocation=new OpenLayers.LonLat(location.location.long,location.location.lat).transform(
                    fromProjection,
                    map.getProjectionObject()
                );
        
        if(map.getExtent().containsLonLat(llocation,{inclusive:true})){
            map.panTo(llocation);
                $timeout(function(){
                    map.zoomTo(zoom||12);
                },1000);
        }
        else{
            var b=new OpenLayers.Bounds();
            b.extend(map.getCenter());
            b.extend(llocation);
            map.zoomToExtent(b,true);
            $timeout(function(){
                map.panTo(llocation);
                $timeout(function(){
                    map.zoomTo(12);
                },1000);
            },300)
        }
    }
    else if(location.top){
        var bounds=new OpenLayers.Bounds(location.left, location.bottom,location.right,location.top).transform(
                    fromProjection,
                    map.getProjectionObject()
                );
        map.zoomToExtent(bounds);
    }
    }
    
    $timeout(function(){resize();
    
    
    
    },100);
    
             }
        }
        
    }])
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
                        scope.$parent.$parent.$broadcast('collapse',scope.$id);
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
                       if(id!==scope.$id)
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
               
               scope.updateScrolls=update;
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
                        $rootScope.$broadcast('collapse',scope.$id);
                    });
                    
                    $event.stopPropagation();
                    $event.preventDefault();

                });
                
                scope.$on('collapse',function($event,id){
                    if(id!==scope.$id)
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
                    $rootScope.$broadcast('collapse',scope.$id);
                };
                
                scope.$watch('arr',function(){
                    scope.list=scope.$parent[scope.arr];
                    
                });
                
                scope.$on('collapse',function($event,id){
                    if(id!=scope.$id)
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
    .directive('takePos',['$timeout',function($timeout){
        return {
            restrict:'C',
            replace:false,
            link:function(scope,element,attrs){
                if(navigator.geolocation)
                    navigator.geolocation.getCurrentPosition(function(loc){
                        scope.SetLocation(loc);
                        scope.$apply();
                    },null,{enableHighAccuracy: true,timeout: 5000,maximumAge: 0});
            }
               
        };
    }])
    .directive('shareItem',['$timeout',function($timeout){
        return {
            restrict:'C',
            scope:{
                title:'@titulo',
                key:'@key',
                service:'@service',
                note:'@note',
                tags:'@tags',
                link:'@lnk'
                
            },
            link:function(scope,element,attrs){
                
                var services={
                    "5":{title:"FaceBook", args:'width=200,height=100'},
                    "7":{title:"Twitter", args:'width=462,height=504'},
                    "309":{title:'Pinterest', args:'width=200,height=100'}
                }
                
                $(element).attr('title','Share With '+services[scope.service].title);
                scope.Share=function($event){
                    if($event){
                        $event.preventDefault();
                        $event.stopPropagation();
                        $event.stopImmediatePropagation();
                    }
                    var url="http://www.shareaholic.com/api/share/?v=1&apitype=1&apikey="+scope.key+"&service="+scope.service+"&title="+encodeURIComponent(scope.title)+"&link="+scope.link;
                
                    window.open(url,scope.title,services[scope.service].args);
                };
            }
        };
    }])
    .directive('searchingTerm',['$timeout','$http','$rootScope',function($timeout,$http,$rootScope){
        return {
            restrict:'C',
            template:'<span  class="search_term {{editable?\'edit\':\'\'}} {{(editable && !valid)?\'error\':\'\'}} {{(!editable && valid)?\'accepted\':\'\'}}" >\
<style>\
.searching_bar .search_term{\
            display:inline-block\
        }\
 .searching_bar .search_term .term-cont{\
            position:relative;\
            display:inline-block;\
            /*border:solid 1px #ddd;\
            padding:5px;\
            width:270px;\
            text-align:left;\
            padding-top:10px;\
            padding-bottom:10px;\
            border-radius:5px;*/\
        }\
 .searching_bar .search_term .search-item-commit{\
            /*width:43px;\
            height:43px;*/\
            display:inline-block;\
            \
        }\
        \
        \
.searching_bar .search_term .list{\
            position:absolute;\
            left:0;\
            top:100%;\
            background-color:white;\
            overflow:hidden;\
        }\
        \
.searching_bar .search_term.accepted{\
            /*background-color:lightblue;\
            color:white;\
            font-weight:bold;\
            border:solid 1px blue;*/\
            \
        }\
        \
.searching_bar .search_term.edit.error{\
            /*display:inline;\
            position:relative;\
            border:solid 2px #ff5555;*/\
        }\
        \
.searching_bar .search_term.ng-leave{\
            display:none;\
        }\
        \
                \
.searching_bar .search_term.edit .icon-remove{\
           display:none;\
        }\
        .searching_bar .search_term.edit .term{\
           display:inline-block;\
           margin-bottom:0px;\
           /* line-height:1em;\
            \
            \
            width:250px;\
            padding:0;\
            font-size:16px;*/\
           \
        }\
.searching_bar .search_term.edit .display{\
            display:none;\
           \
        }\
        \
.searching_bar .search_term.accepted .term{\
            display:none;\
           \
        }\
        \
.searching_bar .search_term.accepted .display{\
            display:inline;\
           \
        }\
\
        \
.searching_bar .search_term .term, .searching_bar .search_term .term:focus, .searching_bar .search_term .term:hover{\
            border:none !important;\
            box-shadow:none !important;\
            outline: none !important;\
\
        }\
\
.searching_bar .hidden-terms-cont{\
           /* min-height:80px;\
            background-color:#EEE;\
            border:solid #d9d9d9 1px;\
            position:relative;\
            margin-top:10px;*/\
        }\
        \
.searching_bar .hidden-terms-cont .arrow{\
                /*border: solid 11px transparent;\
                border-bottom-color:#d9d9d9 !important;\
                top:-22px;\
                width:-11px;\
                */\
                height:0px;\
                right:55px;\
                position:absolute;\
                \
        }\
        \
.searching_bar .hidden-terms-cont .arrow:after {\
            position: absolute;\
            display: block;\
            width: 0;\
            height: 0;\
            border-color: transparent;\
            border-style: solid;\
            position: absolute;\
            top:1px;\
display: block;\
width: 0;\
height: 0;\
border-color: transparent;\
border-style: solid;\
/*border-width: 10px;*/\
content: "";\
bottom: 1px;\
margin-left: -10px;\
/*border-bottom-color: #eee;*/\
border-top-width: 0;\
        position:absolute;\
       }\
</style>\
\
    \
    <table cellspacing="0" cellpadding="0"> \
          <tr>\
              <td style="vertical-align:top; padding:0">\
                  \
          <span class="term-cont">         \
            <input type="text"  placeholder="{/{placeh}/}" ng-model="value" ng-disabled="searchingrt" class="term"/>\
                <span class="display">{/{value}/}</span>\
                <span ng-hide="(!editable  || !active)" class="list" style="z-index:4000">\
                    <ul>\
                        <li ng-repeat="cat in filteredList">\
                            <h4 ng-if="scats">{/{cat.name}/}</h4>\
                            <ul>\
                                <li ng-repeat="term in cat.terms" ng-click="$parent.$parent.Force(term.id,term.name)">{/{term.name}/}</li>\
                            </ul>\
                        </li>\
                    </ul>\
                </span>\
                <i class="icon-remove" ng-click="Delete()"></i>\
       </span></td><td style="vertical-align:top; padding:0">\
                <span class="search-item-commit" ng-if="!autoCommit1" ng-click="submit()"></span>\
              </td>\
      </tr>\
      </table>\
            </span>',
            //templateUrl:'views/searchterm.html',
                //transclude:true,
            replace:true,
            require:'^searchBar',
            scope:{
                config:'=config',
                value:'=value',
                id:'=id',
                valid:'=valid',
                editable:'=editable',
                active:'=active',
                autoCommit:'@autoCommit',
                placeh:'@placeh',
                elast:'@elast',
                method:'@method',
                area:'@area',
                log:'@log',
                extra:'@extra'
            },
            link:function(scope,element,attrs,bar){
                
                var config={
                    url:bar.baseUrl||"http://api.urban4m.com:9200/model/_search?q=name:",
                    charsCount:bar.charCount || 3,
                    delimiter:bar.delimiter
                };
               
               
               scope.autoCommit1=!scope.autoCommit || !(!scope.autoCommit.replace(/false/i,''));
               scope.elastic=!scope.elast || !(!scope.elast.replace(/false/i,''));
               var last_forced={id:-1, name:''};
               var logging=!!scope.log || !(!scope.elast.replace(/false/i,''));
               
               scope.scats=bar.showCats;

                scope.searching=false;

                
                var timeHandler=null;
                
                var input=$(element).find('input');
                var close=$(element).find('div.close');
                if(scope.active){
                    input.focus();
                }
                var res_list=null;
                scope.filteredList=[];
                
                function analize(){
                    scope.value=$.trim(scope.value);
                    
                    
                    
                    var start=1;
                    var temp="";
                     var parts=config.delimiter?scope.value.split(config.delimiter):[scope.value];
                    temp=temp.length?temp:parts[0];
                    
                   
                    for(var i=start; i<parts.length;i++){
                        bar.AddTerm({active:true,valid:true,editable:true, value:parts[i]});
                    }
                    scope.value=temp;
                    return parts.length>1;
                }
                
                scope.Delete=function(){
                    bar.RemoveTerm(scope.id);
                }
                
                $(input).focus(function(){
                    scope.active=true;
                    scope.$apply();
                })
                
                $(input).blur(function(){
                    scope.active=false;
                   
                    
                })
                
                $(input).keydown(function(e){
                    if(e.keyCode===13){
                        ForceFirst();
                        scope.$apply();
                    }
                    else if(e.keyCode===27){
                       scope.Delete();
                        scope.$apply();
                    }
                })
                
                var ForceFirst=function(){
                    if( !scope.filteredList.length)
                        return false;
                    scope.Force(scope.filteredList[0].elems[0].id,scope.filteredList[0].elems[0].name);
                    return true;
                }
                
                scope.Force=function(id,name){
                    if(logging){
                        Log({user_term:scope.value,selected_term:name,selected_term_id:id});
                    }
                    scope.id=id;
                    scope.value=name;
                    last_forced.id=id;
                    last_forced.name=name;
                   if(scope.autoCommit1)
                       submit();
                    
                }
                
               function submit(){
                    config.delimiter=null;
                    scope.valid=true;
                    scope.editable=false;
                    scope.active=false;
                    input.blur();
                    if(bar.type === 'addr'){
                        var split_id=scope.id.split('_');
                        var lobj={
                            msa:split_id[0],
                            location:JSON.parse(split_id[1])
                        }
                        $rootScope.$broadcast('addressSelected',lobj)
                    }
                }
                
                
                
                
                scope.submit=function(){
                    //submit();
                    if(scope.value && scope.value.length && scope.valid){
                        var subm=true;
                        if(scope.value!==last_forced.name || scope.id!== last_forced.id)
                            subm=ForceFirst();
                        if(subm)
                            submit();
                    }
                }
                
                
                scope.$watch('value',function(nval,oval){
                    if(!scope.editable && scope.active)
                        scope.editable=true;
                    
                    if(timeHandler){
                        $timeout.cancel(timeHandler);
                        timeHandler=null;
                    }
                    

                    if(!scope.editable || !scope.value || scope.value.length<config.charsCount){
                        scope.valid=true;
                       res_list={};
                       scope.filteredList=[];
                        return;
                    }
                    
                   var analisis=analize();
                    
                   timeHandler=$timeout(function(){Fetch(analisis);},200); 
                   //Fetch(); 
                        
                    
                });
                
               scope.$on('takeFocus',function(e,id){
                    if(id===scope.id)
                        input.focus();
                    
                })
                
                scope.$on('submitionError',function($address,type){
                    if(type==="address" && bar.addr)
                        scope.valid=false;
                })
                
                
                
                function Fetch(auto){
                    var l_auto=auto;
                      scope.searching=true;
                      var callconfig={};
                      
                     var querys='{"fields": ["meta_" ],"query" : {"bool" : {"must" : [{ "match" : {"meta_" : "'+scope.value+'"}}], "should" : [{ "match" : {"msa_short" : "'+scope.area+'"}}],"minimum_should_match" : 0,"boost" : 1.0}},"highlight" : {"fields" : {"*" : {"fragment_size" : 50,"number_of_fragments" : 1}}}}';
                      querys='{"query":{"query_string":{"query":"'+scope.value+'"}},"fields":["meta_"]}';
                      
                      
                      
                        var val=scope.elastic?querys:scope.value+(scope.extra?('/'+scope.extra):'');
                      callconfig.url=scope.method!='post'?(config.url+encodeURI(val.replace(/,/g,'___'))):config.url;
                      callconfig.method=scope.method||'get';
                      if(scope.method && scope.method=='post')
                          callconfig.data=val;
                      $http(callconfig).success(function(data){
                            scope.searching=false;
                                                   switch(bar.type){
                                case 'addr':{
                                      res_list=TranslateAddress(data);
                                        break;
                                }
                                default:{
                                     res_list=Translate_temp(data);   
                                }
                            }
                            
                            Validate(l_auto);
                        });
                }
                
                function Log(content){
                     var callconfig={};
                      callconfig.url=config.url
                      callconfig.method='post';
                      callconfig.data=content;
                      $http(callconfig);
                }
                
                function Translate(obj){
                    var nObj={};
                    for(var i=0;i<obj.hits.hits.length;i++){
                        if(!nObj[obj.hits.hits[i]._type])
                            nObj[obj.hits.hits[i]._type]=[];
                        nObj[obj.hits.hits[i]._type].push(obj.hits.hits[i]._source);
                        
                       
                    }
                    return nObj;
                }
                
               function Translate_temp(obj){
                    var nObj={"terms":[]};
                    for(var i=0;i<obj.hits.hits.length;i++){
                        var lid=$.trim(obj.hits.hits[i]._id).split('-');
                        var nobj={
                            name:$.trim(obj.hits.hits[i].fields.meta_),
                            id:+(lid[1]||lid[0])
                            
                        }
                        nObj.terms.push(nobj);
                        
                       
                    }
                    if (!nObj.terms.length)
                        delete nObj.terms;
                    return nObj;
                }
                
                
               function TranslateAddress(obj){
                    var nObj={"address":[]};
                    for(var i=0;i<obj.hits.hits.length;i++){
                        var lobj=obj.hits.hits[i].fields;
                        var lloc=(lobj.location && !lobj["location.lon"])?{long:lobj.location[0],lat:lobj.location[1]}:(lobj["location.lon"]?({long:lobj["location.lon"],lat:lobj["location.lat"]}):lobj.bbox_);
                        
                        var nobj={
                            name:lobj.address||lobj.unit_name||((lobj.state||lobj.name_adm1)?(lobj.msa_name+', '+(lobj.state||lobj.name_adm1)):+lobj.msa_long),
                            id:lobj.msaid+'_'+JSON.stringify(lloc)
                           };
                        nObj.address.push(nobj);
                        
                       
                    }
                    return nObj;
                }
                
                function Validate( autocomplete){
                    var terms={};
                    scope.filteredList=[];
                    for(var i in res_list){
                        var obj={name:i,terms:res_list[i]}
                            scope.filteredList.push(obj);
                        for(var j=0;j<res_list[i].length;j++){
                            
                            
                            /*if(res_list[i][j].name.toString().toLowerCase().match(scope.value.toString().toLowerCase())){
                                if(!terms[i])
                                    terms[i]=[];
                                terms[i].push(res_list[i][j])
                            }*/
                                
                        }
                            
                    }
                    /*for(var i in terms){
                        
                        var obj={name:i,terms:terms[i]}
                        scope.filteredList.push(obj);
                    }*/
                    
  
                    scope.valid=scope.filteredList.length;
                    if(autocomplete && scope.filteredList.length==1 && scope.filteredList[0].terms.length==1){
                        config.delimiter=null;
                        scope.value=scope.filteredList[0].terms[0].name;
                        scope.id=scope.filteredList[0].terms[0].id;
                        scope.editable=false
                    }
                    
                    return scope.valid;
                }
                
             }
        };
    }])
    .directive('searchBar',['$timeout','SelectionService','$rootScope',function($timeout,SelectionService,$rootScope){
        return {
            restrict:'C',
            replace:true,
            template:'<div class="searching_bar"><span class="searching_term"  ng-repeat="term in searchTerms" value="term.value" editable="term.editable" valid="term.valid" id="term.id" active="term.active" auto_commit="{/{autoCommit}/}" placeh="{/{placeh}/}" elast="{/{elastic}/}" method="{/{method}/}" area="{/{area}/}" log="{/{log}/}"  extra="{/{extra}/}"></span>\
                       <div class="hidden-terms-cont" ng-show="showHidden">\
                            <div class="arrow"></div>\
                            <h4 ng-hide="hiddenTerms.length">Add a wish list to refine your search</h4>\
                            <span class="searching_term" ng-repeat="term in hiddenTerms" value="term.value" editable="term.editable" valid="term.valid" id="term.id" active="term.active" auto_commit="true"  elast="{/{elastic}/}" method="{/{method}/}"  area="{/{area}/}"  log="{/{log}/}" extra="{/{extra}/}"></span>\
                        </div></div>',
            scope:{
                showHidden:"@showHidden",
                visibleItems:"@visibles",
                maxSearch:"@maxSearch",
                showCategories:"@showCategories",
                baseUrl:"@baseUrl",
                type:"@type",
                autoCommit:'@autoCommit',
                placeh:'@placeh',
                lfs:'@lfs',
                elastic:'@elastic',
                method:'@method',
                area:'@area',
                log:'@log',
                extra:'@extra'
            },
            controller:function($scope){
                $scope.showHidden=!$scope.showHidden.replace(/true/i,'');
                $scope.searchTerms=[];
                $scope.hiddenTerms=[];
                $scope.visibleItems=+$scope.visibleItems;
                var creating=true;
                var maxSearch=+$scope.maxSearch;
                maxSearch=maxSearch?maxSearch:1;
                
                this.type=$scope.type||'search';
                this.addr=this.type==='addr';
                this.delimiter=this.type==="addr"?null:",";
                
                this.baseUrl=$scope.baseUrl;
                this.showcats=!$scope.showCategories || !(!$scope.showCategories.replace(/false/i,''));
                this.lfs=!$scope.lfs?false:!$scope.lfs.replace(/true/i,'');
                var stash=[ $scope.searchTerms,  $scope.hiddenTerms];
                var self=this;
                this.AddTerm=function(obj,skip){
                    if(maxSearch>0 && ($scope.hiddenTerms.length+$scope.searchTerms.length)>=maxSearch)
                        return;
                    
                   if($scope.searchTerms[0] && $scope.searchTerms[0].editable && !$scope.searchTerms[0].value ){
                        $scope.$broadcast('takeFocus',$scope.searchTerms[0].id)
                        return;
                    }
                    
                    if(!obj.id){
                        obj.id=$scope.hiddenTerms.length+$scope.searchTerms.length+"_"+Date.now();
                    }
                    if($scope.searchTerms.length>=$scope.visibleItems){
                        var overflow=$scope.searchTerms.pop();
                        $scope.hiddenTerms.unshift(overflow);
                    }
                    
                    
                    //return
                       $scope.searchTerms.unshift(obj);
                         $timeout(function(){
                            var terms=[];
                            for(var i=0;i<$scope.searchTerms.length;i++){
                                if(!$scope.searchTerms[i].editable && $scope.searchTerms[i].valid){
                                    terms.push({name:$scope.searchTerms[i].value,id:$scope.searchTerms[i].id});
                                }
                            }
                            
                            for(var i=0;i<$scope.hiddenTerms.length;i++){
                                if(!$scope.hiddenTerms[i].editable && $scope.hiddenTerms[i].valid){
                                    terms.push({name:$scope.hiddenTerms[i].value,id:$scope.hiddenTerms[i].id});
                                }
                            }
                            if(!self.addr && !skip){
                                if( !creating){
                                    $rootScope.$broadcast('searchChanged',terms);
                                   
                                }
                                else
                                     creating=false;
                            }
                        });
                }
                
                this.RemoveTerm=function(id){
                    /*if(!$scope.hiddenTerms.length && $scope.searchTerms.length==1)
                        return;*/
                    var pos=FindTerm(id);
                    var reportable=true;
                    if(pos){
                        var elem=stash[pos.arr].splice(pos.pos,1);
                        reportable=!elem[0].editable;
                        if(elem[0].lifestyle)
                            SelectionService.UnselectLifeStyle(elem[0].id)
                    }
                    if($scope.searchTerms.length<$scope.visibleItems && $scope.hiddenTerms.length)
                        $scope.searchTerms.push($scope.hiddenTerms.shift());
                    
                    //return;
                     $timeout(function(){
                            var terms=[];
                            for(var i=0;i<$scope.searchTerms.length;i++){
                                if(!$scope.searchTerms[i].editable && $scope.searchTerms[i].valid){
                                    terms.push({name:$scope.searchTerms[i].value,id:$scope.searchTerms[i].id});
                                }
                            }
                            
                            for(var i=0;i<$scope.hiddenTerms.length;i++){
                                if(!$scope.hiddenTerms[i].editable && $scope.hiddenTerms[i].valid){
                                    terms.push({name:$scope.hiddenTerms[i].value,id:$scope.hiddenTerms[i].id});
                                }
                            }
                            if(!self.addr && reportable)
                                $rootScope.$broadcast('searchChanged',terms);
                        });
                }
                
                function FindTerm(id){
                    stash=[ $scope.searchTerms,  $scope.hiddenTerms];
                    var result=null;
                    for(var i=0;i<stash.length;i++){
                        for(var j=0;j<stash[i].length;j++){
                            if(stash[i][j].id===id){
                                result={arr:i,pos:j};
                                break;
                            }
                        }
                    }
                    return result;
                }
                
                $scope.$watch(function(){return JSON.stringify($scope.searchTerms);},function(){
                    
                    if($scope.searchTerms &&(!$scope.searchTerms.length || !$scope.searchTerms[0].editable))
                        self.AddTerm({value:"",editable:true,valid:true});
                    if($scope.updateScrolls)
                        $scope.updateScrolls();
                })
                
                if(this.type=='addr'){
                    $scope.$on('takeAddress',function($event,area){
                        $scope.searchTerms[0].id=area.msaid+'_'+area.lonlat;
                        $scope.searchTerms[0].value=area.address;
                        $timeout(function(){
                            $scope.$broadcast('takeFocus',area.msaid+'_'+area.lonlat);
                        })
                        
                    })
                }
                else{
                    $scope.$on('forceTerms',function($event,terms,verify){
                        creating=true;
                        $scope.searchTerms=[];
                        $scope.hiddenTerms=[];
                        for(var i=0;i<terms.length;i++){
                            self.AddTerm({value:terms[i].name,id:terms[i].id,editable:verify,valid:true},true);
                        }
                    });
                }
                                
                    
                
                
               /* if(this.lfs){
                $scope.$watch(function(){return JSON.stringify(SelectionService.activeLifeStyle);},function(){
                    for(var i=0;i<$scope.searchTerms.length;i++){
                        if($scope.searchTerms[i].lifestyle)
                            $scope.searchTerms.splice(i,1);
                    }
                    for(var i=0;i<$scope.hiddenTerms.length;i++){
                        if($scope.hiddenTerms[i].lifestyle)
                            $scope.hiddenTerms.splice(i,1);
                    }
                    if(SelectionService.activeLifeStyle.id && SelectionService.activeLifeStyle.id>0){
                        $scope.searchTerms[0].id=SelectionService.activeLifeStyle.id;
                        $scope.searchTerms[0].value=SelectionService.activeLifeStyle.name;
                        $scope.searchTerms[0].lifestyle=true;
                        $scope.searchTerms[0].valid=true;
                        $scope.searchTerms[0].editable=false;
                        //submit();
                    }
                })
                }*/
            }
        };
    }])    
    .directive('gDrop',['$timeout','SelectionService','$location','$rootScope',function($timeout,SelectionService,$location,$rootScope){
        return {
            restrict:'C',
            replace:true,
            template:'<span class="g-dropdown"  ng-click="ToggleView($event)" style="cursor:pointer"><div class="icon-holder active_lifestyle_{/{selId}/}"></div><span class="header-lifestyle-selector"><span ng-hide="selId" >Custom</span>{/{selName}/}</span><i class="icon-chevron-down" ></i><div class="content" ng-show="show_lfs">\
                        <ul>\
                            <li ng-repeat="opt in options" ng-click="$parent.SelectItem(opt)" ng-class="{active:(opt.id===$parent.selId)}"><div class="icon-holder {/{(lfs.id===$parent.selId)?\'active_\':\'\'}/}lifestyle_{/{opt.id}/}" ></div>{/{opt.name}/} <div class="indication_button"></div></li>\
                            <li  ng-click="SelectItem()" ng-class="{active:(!selId)}"><div class="icon-holder {/{(!selId)?\'active_\':\'\'}/}lifestyle_" ></div>Custom<div class="indication_button"></div></li>\
                        </ul>\
                    </div></span>',
            scope:{
               options:'=options'
                
            },
            link:function(scope,element,attrs){
                scope.selection=SelectionService;
                scope.selId=null;
                scope.SelectItem=function(item){
                    if(!item){
                        scope.selId=null;
                        scope.selName='';
                    }
                    else{
                        
                        scope.selId=item.id;
                        scope.selName=item.name;
                    
                    }
                        $rootScope.$broadcast('elementSelected',{id:element.id,value:scope.selId});
                }

                
                scope.ToggleView=function($event){
                    $event.stopPropagation();
                    scope.show_lfs=!scope.show_lfs;
                    $rootScope.$broadcast('collapse',scope.$id);
                }
                
                scope.$on('collapse',function($event,id){
                    if(id!=scope.$id)
                        scope.show_lfs=false;
                    
                })
            }
        };
    }])
    .directive('collapsable',['$rootScope',function($rootScope){
        return {
            restrict:'C',
             link:function(scope,element,attrs){
                 var first=true;
                $(element).children('.state-toggler').on('click',function(){
                    scope.Toggle();
                })
                var Ggroup=attrs.group;
                scope.expanded=false;
                scope.$on('collapse',function($event,id,group){
                    if(id!==scope.$id && group===Ggroup)
                        scope.expanded=false;
                });
                
                scope.Toggle=function(){
                    scope.expanded=!scope.expanded;
                   first=false;
                }
                
                scope.$watch('expanded',function(val){
                     if(scope.expanded){
                        $rootScope.$broadcast('collapse',scope.$id,attrs.group);
                        element.addClass('expanded');
                        element.removeClass('collapsed');
                    }
                    else{
                        element.removeClass('expanded');
                        element.addClass('collapsed');
                    }
                   if(scope.updateScrolls)
                       scope.updateScrolls();
                })
                
                scope.$watch(function(){return attrs.lfs;},function(val){
                     if(+val>0){
                         
                         if(first){
                             scope.expanded=false;
                             first=false;
                         }
                         return;
                     }
                     else if(val!==undefined /*&& !first*/)
                        scope.expanded=true;
                    
                });
            }
        };
    }])
    .directive('flipable',['$rootScope','$timeout',function($rootScope,$timeout){
        return {
            restrict:'C',
             link:function(scope,element,attrs){
                 var first=true;
                 scope.count=0;
                 //$(element).get().style.cursor='pointer';
                 var count=$(element).children('.sides').length;
                 var animating=false;
                 element.addClass("animated");
                 
                 var clickable=$(element).find('.flipper')[0]?$($(element).find('.flipper')[0]):$(element);
                 
                clickable.on('click',function(){
                    if(animating)
                        return;
                    animating=true;
                    if(!element.hasClass('flipOutY'))
                    element.addClass('flipOutY');
                    $timeout(function(){
                        
                        element.removeClass('flipOutY');
                        element.addClass('flipInY');
                        $timeout(function(){
                            element.removeClass('flipInY');
                            animating=false;
                        },800)
                        scope.count+=1;
                        if(scope.count==count)
                            scope.count=0;
                    },800)
                });
            }
        };
    }])
    .directive('hotspotCard',['$rootScope',function($rootScope){
        return {
            restrict:'C',
            scope:{
               spot:"=hotspot"
            },
            template:'<i class="state-toggler icon-eye-{/{expanded?\'close\':\'open\'}/}"></i>\
            <table><tr><td><svg style="width:56px; height:62px;">\
     <g transform="translate(8,2)">\
    <path\
       class="pulse-point"  stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\
       d="m 22.86161,57.55804 c 0,0 -22.14286,-19.5534 -22.14286,-33.61953 0,-4.93124 4.10714,-22.4519 22.14286,-22.4519 18.03572,0 22.5,14.0866 22.5,22.5 0,13.47133 -22.5,33.57143 -22.5,33.57143 z"/>\
    <text\
       style="font-size:40px;font-style:normal;font-weight:bold;line-height:125%;letter-spacing:0px;word-spacing:0px;fill:#ffffff;fill-opacity:1;stroke:none;font-family:Sans"\
       x="23"\
       y="28.450891"\
       id="text5155"\
       sodipodi:linespacing="125%"><tspan\
         x="14"\
         y="28.450891"\
         style="font-size:14px">{/{spot.pulse}/}</tspan></text>\
  </g>\
    </svg></td><td><h4 style="color:{/{color}/}; display:inline-block; text-align:left; margin-top:-10px;" >{/{spot.name}/}</h4></td></tr></table>\
    <div class="data-card flipable" style="position:relative">\
    <i class="flipper icon-refresh" style="position:absolute; top:5px; right:5px; cursor:pointer"></i>\
    <div class="sides side0" ng-show="count==0">\
        <div ng-repeat="item in spot.scorecard" class="score-spot">\
            <i class="{/{$parent.map[item.id]}/}"></i>\
            <h6 >{/{item.name}/}</h6>\
            <h5 class="score-rank-{/{item.rank}/}">{/{item.value}/}</h5>\
        </div>\
        <div class="score-spot">\
            For even more information about neighborhoods<br><span class="action-text">try Premium</span>\
        </div>\
</div>\
<div class="sides side2"  ng-show="count==1">\
        <div ng-repeat="item in spot.scorecard" class="score-spot">\
            <i class="{/{$parent.map[item.id]}/}"></i>\
            <h6 >{/{item.name}/}</h6>\
            <h5 class="score-rank-{/{item.rank}/}">{/{item.value}/}</h5>\
        </div>\
        <div class="score-spot">\
            backside of the card</span>\
        </div>\
</div>\
    </div>\
        <a class="redir-links"  target="_blanck" href="http://www.yelp.com/search?find_desc={/{$parent.friendlySerch}/}&find_loc={/{spot.name}/}">Find top-rated atractions with Yelp<i class="icon-white icon-chevron-right"></i></a>\
        <a class="redir-links" target="_blanck" href="http://www.zillow.com/homes/for_sale/{/{$parent.bbox.top}/},{/{$parent.bbox.right}/},{/{$parent.bbox.bottom}/},{/{$parent.bbox.left}/}_rect">Find a Home in the Area with Zillow<i class="icon-white icon-chevron-right"></i></a>\
        <a class="redir-links" target="_blanck" href="http://www.hotels.com/search.do?destination={/{spot.name}/}">Find Places to stay with Hotels<i class="icon-white icon-chevron-right"></i></a>\
        <a class="redir-links" target="_blanck" href="http://jobsearch.monster.com/search/?where={/{spot.name}/}">Find Jobs in the Area with Monster<i class="icon-white icon-chevron-right"></i></a>\
    ',
                link:function(scope,element,attrs){
                
               scope.map={
                    hp:'icon-home',
                    mtrans:'icon-road',
                    edu:'icon-book',
                    age:'icon-user',
                    walk:'icon-random'
                }
                scope.$watch(function(){return scope.spot.pulse},function(){
                     scope.color='#f4'+Math.ceil((255+1.25)-13.75*(scope.spot.pulse)).toString(16)+Math.ceil((133)-10.17*(scope.spot.pulse)).toString(16);
                     $(element).find('g path.pulse-point').css('fill',scope.color);
                })
                
                    scope.$on('hotSpotClicked',function($event,id){
                        scope.expanded=scope.spot.gid==id;
                        scope.$apply();
                    });
                
                }
        };
    }])
    .directive('clicktale',['$timeout','$rootScope',function($timeout,$rootScope){
        return {
            restrict:'C',
            replace:true,
            link:function(scope,element,attrs){
                $timeout(function(){
                    $(element).append('<script type="text/javascript">\
/* The ClickTale Balkan Tracking Code may be programmatically customized using hooks:\
   function ClickTalePreRecordingHook() { }\
 For details about ClickTale hooks, please consult the wiki page http://wiki.clicktale.com/Article/Customizing_code_version_2*/\
document.write(unescape("%3Cscript%20src=\'"+(document.location.protocol==\'https:\'?"https://clicktalecdn.sslcs.cdngc.net/www02/ptc/1dccc9e8-b5b7-469c-bdde-bfe9b94e7431.js":"http://cdn.clicktale.net/www02/ptc/1dccc9e8-b5b7-469c-bdde-bfe9b94e7431.js")+"\'%20type=\'text/javascript\'%3E%3C/script%3E"));\
</script>');
                $(element).prepend('<script type="text/javascript">\
var WRInitTime=(new Date()).getTime();\
</script>');
                });
                
                
            }
        };
    }])
;
