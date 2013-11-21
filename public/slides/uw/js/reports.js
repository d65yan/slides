
  
  function ReportsController($scope) {
    
    
  }
  
  
  angular.module('Reports',[]).factory('CommService', function() {
  var CommService = {};
  CommService.getTSV=function(file,f){
        d3.tsv(file, function(s) {
            var formatted={}
            if(s.length==0){
                  formatted.error=1;
            }
            else{
                formatted.headers=[];
                for(var i in s[0]){
                    formatted.headers.push(i);
                }
                formatted.data=s;
            }
            f(formatted);
        })
  };

  return CommService;
}) .directive('systemsList',function(CommService){
        return{
            restrict:'AC',
            replace:false,
            scope:{
                splitNum:"@splitNum",
                icons:'@icons',
                colors:'@colors',
                iconField:'@iconField',
                field:"@field"
             },
            link:function(scope,element,attrs){
               
                     var data=[];
                function Draw(data){
                    if(angular.isUndefined(data))
                        return;
                    if(!data.length){
                        $(element).html('<h4>N/A</h4>');
                        return;
                    }
                     
                     scope.field=scope.field||'name';
                    scope.colors=(scope.colors && scope.colors.length)?angular.fronJson(scope.colors):null;
                    
                    var cols=Math.min(Math.ceil(data.length/(scope.splitNum*1)),4);
                    
                    var listTable='<table style="width:100%" cellspacing="30"><tr>';
                    for(var i=0;i<data.length;i++){
                        var label=(data[i][scope.field].length<=20?data[i][scope.field]:(data[i][scope.field].substr(0,17)+'...'));
                        label=label.split('');
                        var newLabel=''
                        do{
                            var tarr=label.splice(0,11);
                            if(tarr.indexOf(' ')<0 && label.length>0){
                                label.unshift(tarr.pop());
                                tarr.push(' ');
                            }
                            newLabel+=tarr.join('');
                        }while(label.length>0)
                        
                        listTable+='<td style="width:33%"><table><tr>'+((scope.icons && scope.icons.length)?'<td><img src="'+scope.icons+'/'+((scope.iconField && scope.iconField.length)?data[i][scope.iconField]:data[i][scope.field])+'.png"></td>':'')+'<td ><div class="small-system-name" style="'+((scope.colors && scope.colors.length)?('color:#'+scope.color[i]):'')+'">'+newLabel+'</div></td></tr></table></td>'+((((i+1)%cols==0 && i!=0)||cols==1)?'</tr><tr>':'');
                    }
                    listTable+='</tr></table>';
            
            
            
                    $(element).html(listTable);
                }
                
       scope.$watch(function (){return attrs.data}, function (value) {
            if(angular.isUndefined(value) || !value.length || value=='undefined')
                return;
                scope.data=angular.fromJson(value);
                Draw(scope.data);
                
            
        });
             }
        }
         })
  .directive('smartList',function(CommService){
        return{
            restrict:'AC',
            replace:false,
            scope:{
                splitNum:"@splitNum",
                icons:'@icons',
                colors:'@colors',
                iconFiled:'@iconField',
                field:"@field"
             },
            link:function(scope,element,attrs){
               
                     var data=[];
                function Draw(data){
                    if(angular.isUndefined(data))
                        return;
                    if(!data.length){
                        $(element).html('<h4>N/A</h4>');
                        return;
                    }
                     
                     scope.field=scope.field||'name';
                    
                    
                    var cols=Math.min(Math.ceil(data.length/(scope.splitNum*1)),4);
                    var listTable='<table style="width:100%"><tr>';
                    for(var i=0;i<data.length;i++){
                        listTable+='<td style="width:25%"><h4>'+(data[i][scope.field].length<=30?data[i][scope.field]:(data[i][scope.field].substr(0,27)+'...'))+'</h4></td>'+((((Math.ceil(i/cols)*cols)-1==i && i!=0)||cols==1)?'</tr><tr>':'');
                    }
                    listTable+='</tr></table>';
            
            
            
                    $(element).html(listTable);
                }
                
       scope.$watch(function (){return attrs.data}, function (value) {
            if(angular.isUndefined(value) || !value.length || value=='undefined')
                return;
                scope.data=angular.fromJson(value);
                Draw(scope.data);
                
            
        });
             }
        }
    }).directive('pieChart',function(CommService){
        return{
            restrict:'AC',
            replace:false,
            scope:{
                file:'@resource',
                sectorField:'@graphField'||null,
                legendField:'@legendField'||null,
                showLegend:'@showLegend'||true,
                legendValues:'@legendValues'||false,
                chartValues:'@chartLegend'||false,
                colors:'@colors'||'',
                expandToLegend:'@expandToLegend'||true,
                legendPosition:'@legendPosition'||'bottom',
                inrad:'@inrad'||0
                
            },
            template:'<style>.position_left{float:left;}.position_right{float:right}</style><div id="piecontainer_{{$id}}"></div> <h2 ng-show="title.length>0" class="report_title title_position_{{titlePosition}}">{{title}}</h2>',
            link:function(scope,element,attrs){
                    scope.isLoading=true;
                scope.data={headers:[],data:[]};
                
                
                     var data=[];
                     

                   var color = d3.scale.ordinal()
                        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

       
                 function canDraw(){
                     return (attrs.redraw && attrs.redraw.length && attrs.redraw!='false' && scope.data && scope.data.length && !scope.data.headers);
                 }       
                     
                
                function Draw(data){
                    if(!angular.isUndefined(data.headers) || angular.isUndefined(data))
                        return;
                    element.children().remove();
                    var font = Math.floor(element.css('font-size').replace(/px|%|em|ex|in|cm|mm|pt|pc/,'')*1)||10;
                    font='80%';
                    var width = $(element).width();
                    var height =$(element).height()||width;
                    
                    var graphwidth=scope.chartLegend?width*0.55:width;
                    var graphheight=scope.chartLegend?height*0.55:width;
                    
                    var radius = Math.min(graphwidth, graphheight) / 2;
                    var arc = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(scope.inrad);

                        var pie = d3.layout.pie()
                        .sort(null)
                        .value(function(d){return d.value;});
                        
                        var node=$(element).get()[0];
                     
                    var svg = d3.select(node).append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                    
                    var arcCounter=0;
                    var coordList=[];
                    var orgCoordList=[];
                    var g = svg.selectAll(".arc")
                            .data(pie(data))
                            .enter().append("g")
                            .attr("class", "arc");

                            g.append("path")
                            .attr("d", arc)
                            .style("fill", function(d) { return color(d.data.legend); });
                           
                           if(attrs.chartLegend && attrs.chartLegend!='false' && attrs.chartLegend!=''){                            
                            g.append("text")
                            .attr("transform", function(d) {
                                var i= arc.centroid(d);
                                var offset=1;
                                if(arcCounter==(data.length-1)){
                                    if((data.length%2)){
                                        offset=1.1;
                                        arcCounter++;
                                    }
                                }
                                var ti=[i[0],i[1]];
                                orgCoordList.push(ti);
                                i[0]*=(3+((arcCounter%2)*offset));
                                i[1]*=(2.8+((arcCounter%2)*offset));
                                coordList.push(i);
                                arcCounter++;
                                return "translate("+i+")"; 
                            })
                            .attr("font-size", font)
                            .style("text-anchor", "middle")
                            .text(function(d) { 
                                return d.data.legend;
                            });
                            }
                            
                           if(attrs.legendValue && (attrs.chartLegend && attrs.chartLegend!='false' && attrs.chartLegend!='')){
                               arcCounter=0;
                            g.append("text")
                            .attr("transform", function(d,index) {
                                
                                coordList[index][1]+=10;
                                return "translate("+ coordList[index]+")"; 
                            })
                            .attr("font-size", font)
                            .style("text-anchor", "middle")
                            .text(function(d) { 
                                return d.data.value;
                            });
                            }
                            
                            if(attrs.legendValue && (attrs.chartLegend && attrs.chartLegend!='false' && attrs.chartLegend!='')){
                               
                            g.append("line")
                            .attr("x1", function(d,index) {
                                
                                return orgCoordList[index][0]; 
                            }).attr("y1", function(d,index) {
                                
                                return orgCoordList[index][1]; 
                            }).attr("x2", function(d,index) {
                                
                                return coordList[index][0]; 
                            }).attr("y2", function(d,index) {
                                
                                return coordList[index][1]+((coordList[index][1]>=0)?-20:+5); 
                            })
                            .attr("stroke", '#000000');
                            }
                            
                            
                            if(attrs.showLegend){
                             var legendHtml=''
                             var max=0;
                             var max_length=0;
                                for(var i in data){
                                    element.append('<span  id="content_measurement_span" style="margin:1.8em; padding:0; position:relative; visibility:hidden; font-size:100%"><div style="width:1.2em; position:absolute;left:-1em; top:0px; height:1em;"></div>'+$.trim((scope.legendValues?data[i].value:''))+'-'+$.trim(data[i].legend)+'</span>');
                                    
                                    var test=$('#content_measurement_span');
                                    max_length=Math.max(max_length,data[i].legend.length);
                                    max=Math.max(max, $(test).width());
                                    $(test).remove();
                                    legendHtml+='<span style="margin:1.8em; padding:0; position:relative; display:block; line-height:1em; padding-top:0.5em; font-size:100%"><div style="float:left; margin-right:0.18em; padding-right:1.2em; position:relative; text-align:right; line-height:1em; white-space:pre; width:__MAX_WIDTH__em">'+$.trim(data[i].legend)+'<div style="width:1em; position:absolute;right:0px; top:0px; height:1em; background-color:'+color(i)+'"></div></div>'+$.trim((scope.legendValues?data[i].value:''))+'</span>';
                                }
                                
                                max_length=max_length/2;
                                legendHtml=legendHtml.replace(/__MAX_WIDTH__/g,max_length);
                               var cells=Math.floor(width/max);
                                cells=cells==0?1:cells;
                                legendHtml=legendHtml.split('</span>');
                                var table='<table class="pie_legend position_'+(scope.legendPosition||'')+'" style="background-color:white; z-index:400; font-size:'+font+'"><tr>'
                                for(var i =1;i<=legendHtml.length;i++){
                                    table+=('<td style="clear:both">'+legendHtml[i-1]+'</td></span>'+(((i%cells==0 && i>=cells && scope.showLegend && ((scope.legendPosition && !scope.legendPosition.match(/right|left/))|| !scope.legendPosition))||(scope.legendPosition && scope.legendPosition.match(/right|left/)))?'</tr><tr>':''));
                                }
                                table+='</tr></table>'
                                element.prepend(table);
                                
                                if(scope.legendPosition && scope.legendPosition.match('right|left')){
                                    var graphW=$(element).children('svg').width();
                                    graphW+=(max+12);
                                    $(element).css('width',graphW+'px');
                                }
                                
                            }
                            
                         if(attrs.showFloatingLegend){
                             var legendHtml=''
                             var max=0;
                                for(var i in data){
                                    element.append('<span  id="content_measurement_span" style="margin:1.8em; padding:0; position:relative; visibility:hidden"><div style="width:1em; position:absolute;left:-1em; top:0px; height:1em; background-color:'+color(i)+'"></div>'+data[i].legend+(scope.legendValue?('-('+data[i].value+')'):'')+'</span>');
                                    
                                    var test=$('#content_measurement_span');
                                    
                                    max=Math.max(max, $(test).width());
                                    $(test).remove();
                                    legendHtml+='<span style="margin:1.8em; padding:0; position:relative;"><div style="width:1em; position:absolute;left:-1em; top:0px; height:1em; background-color:'+color(i)+'"></div>&nbsp;&nbsp;'+data[i].legend+(attrs.legendValue?('<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;('+data[i].value+')'):'')+'</span>';
                                }
                               var cells=Math.floor(width/max);
                                cells=cells==0?1:cells;
                                legendHtml=legendHtml.split('</span>');
                                var table='<div class="floating-legend"><table class="pie_legend" style="width:100%" cellspacing="5"><tr>'
                                for(var i =1;i<=legendHtml.length;i++){
                                    table+=('<td>'+legendHtml[i-1]+'</td></span>'+((i%cells==0 && i>=cells)?'</tr><tr>':''));
                                }
                                table+='</tr></table></div>'
                                element.append(table);
                            }
                            
                }
                

                function update(value){ 
                    CommService.getTSV(value,function(data){
                        var piedata=[];
                        element.html('');
                        
                        if(!attrs.valueField|| data.headers.indexOf(attrs.valueField)<0){
                          
                            for(var key=0;key<data.headers.length;key++){
                                for(var values in data.data){
                                    
                                    if(isNaN(data.data[values][data.headers[key]]*1) ){
                                       piedata=[];
                                       break
                                    }
                                    piedata.push({value:(data.data[values][data.headers[key]]*1)})
                                        
                                }
                                if(piedata.length>0)
                                    break;
                            }
                        }
                        else{
                            for(var i in data.data){
                                if(isNaN(data.data[i][attrs.legendField]*1))
                                    return;
                                piedata.push({value:(data.data[i][attrs.legendField].toString())});
                            }
                        }
                
                if(piedata.length==0)
                    return;
                        
                        var legends=true;
                        if(!attrs.legendField|| data.headers.indexOf(attrs.legendField)<0){
                          
                            for(var key=0;key<data.headers.length;key++){
                                for(var values in data.data){
                                    piedata[values].legend=(data.data[values][data.headers[key]].toString());
                                    if(!isNaN(data.data[values][data.headers[key]]*1) && key<data.headers.length-1){
                                        legends=false;
                                        break;
                                    }
                                        
                                }
                                if(legends)
                                    break;
                                legends=true;
                            }
                        }
                        else
                            for(var i in data.data)
                                piedata.legend.push(data.data[i][attrs.legendField].toString())
                            
                        
                        
                        
                      
                        
                        
                        
                       scope.data=piedata;
                       if(!canDraw())
                            return;
                       Draw(piedata);
                   })
                }
       
        scope.$watch(function (){return attrs.resource}, function (value) {
            if(!canDraw())
                return;
            
                update(value);
                
            
        });
        
                scope.$watch(function (){return attrs.redraw}, function (value) {
            if(!canDraw())
                return;
            
                Draw(scope.data);
                
            
        });
    
                    scope.$watch(function (){return attrs.chartLegend}, function (value) {
                        if(!canDraw())
                            return;
                        Draw(scope.data);
                
            
        });
        
        
       scope.$watch(function (){return attrs.data}, function (value) {
            if(angular.isUndefined(value) || !value.length || value=='undefined')
                return;
                scope.data=angular.fromJson(value);
                
                if(!canDraw())
                return;
                Draw(scope.data);
                
            
        });
             }
        }
    }).directive('radarChart',function(CommService){
        return{
            restrict:'AC',
            replace:false,
            scope:{
                
            },
            template:'<div id="radarcontainer_{{$id}}"></div> <h2 ng-show="title.length>0" class="report_title title_position_{{titlePosition}}">{{title}}</h2>',
            link:function(scope,element,attrs,$id){
                    scope.isLoading=true;
                scope.data={headers:[],data:[]};
                
                
                     var data=[];
                     

                   var color = d3.scale.ordinal()
                        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

       
                        
                     
                
                function Draw(data){
                    if(!angular.isUndefined(data.headers) || angular.isUndefined(data))
                        return
                    var d=[];
                    for(var i =0;i<data.length;i++){
                        d.push({axis:data[i].legend,value:data[i].value});
                    }
                
                    var width = $(element).width();
                    var height =$(element).height()||width;
                
                    RadarChart.draw('#radarcontainer_'+scope.$id,[d],{w:width,h:height});
                
                    var grad=180/data.length;
            
                    $(element).css('transform','rotate('+grad+'deg)');
                    $(element).css('-moz-transform','rotate('+grad+'deg)');
                    $(element).css('-webkit-transform','rotate('+grad+'deg)');
                    
                    var total=data.length;
                    var radians= 2*Math.PI;
                    for(var i=0;i<total;i++){
                        
                        var org_x=-width/2*(1-Math.sin(i*radians/total))-Math.sin(i*radians/total);
                        var org_y=height/2*(1-0.5*Math.cos(i*radians/total))+Math.cos(i*radians/total);
                        
                        var x=width-width/2*(1-Math.sin(i*radians/total))+30*(org_y/Math.abs(org_y)*2)*Math.sin(i*radians/total);
                        var y=height-height/2*(1-Math.cos(i*radians/total))-25*(org_x/Math.abs(org_x)*2)*Math.cos(i*radians/total);
                        
                        x=width-x-40;
                        y=height-y-30;
                        
                        var img='<td><img src="public/images/chart/systems/'+data[i].legend.toString().toLowerCase()+'.png"></td>';
                        var text='<td>'+data[i].legend+'</td>';
                        
                        var order=Math.abs(org_x)<(width/2)?(img+text):(Math.abs(org_x)>(width/2)?(text+img):(Math.abs(org_y)<(height/2)?(text+img):(img+text)));
                        
                        $(element).append('<div id="system_'+i+'" style="left:'+x+'px; top:'+y+'px" class="radar-report-field"><table  cellspacing="20"><tr>'+order+'</tr></table></div>')
                        $('#system_'+i).css('transform','rotate('+(360-grad)+'deg)');
                        $('#system_'+i).css('-moz-transform','rotate('+(360-grad)+'deg)');
                        $('#system_'+i).css('-webkit-transform','rotate('+(360-grad)+'deg)');
                    }
    
                    }
                

                function update(value){ 
                    CommService.getTSV(value,function(data){
                        var piedata=[];
                        element.html('');
                        
                        if(!attrs.valueField|| data.headers.indexOf(attrs.valueField)<0){
                          
                            for(var key=0;key<data.headers.length;key++){
                                for(var values in data.data){
                                    
                                    if(isNaN(data.data[values][data.headers[key]]*1) ){
                                       piedata=[];
                                       break
                                    }
                                    piedata.push({value:(data.data[values][data.headers[key]]*1)})
                                        
                                }
                                if(piedata.length>0)
                                    break;
                            }
                        }
                        else{
                            for(var i in data.data){
                                if(isNaN(data.data[i][attrs.legendField]*1))
                                    return;
                                piedata.push({value:(data.data[i][attrs.legendField].toString())});
                            }
                        }
                
                if(piedata.length==0)
                    return;
                        
                        var legends=true;
                        if(!attrs.legendField|| data.headers.indexOf(attrs.legendField)<0){
                          
                            for(var key=0;key<data.headers.length;key++){
                                for(var values in data.data){
                                    piedata[values].legend=(data.data[values][data.headers[key]].toString());
                                    if(!isNaN(data.data[values][data.headers[key]]*1) && key<data.headers.length-1){
                                        legends=false;
                                        break;
                                    }
                                        
                                }
                                if(legends)
                                    break;
                                legends=true;
                            }
                        }
                        else
                            for(var i in data.data)
                                piedata.legend.push(data.data[i][attrs.legendField].toString())
                            
                        
                        
                        
                      
                        
                        
                        
                       scope.data=piedata;
                       if(attrs.redraw)
                       Draw(radardata);
                   })
                }
       
        scope.$watch(function (){return attrs.resource}, function (value) {
            if(!value)
                return;
            
                update(value);
                
            
        });
        
                scope.$watch(function (){return attrs.redraw}, function (value) {
            if(!value || value=='false' || value=='')
                return;
            
                Draw(scope.data);
                
            
        });
    
                    scope.$watch(function (){return attrs.chartLegend}, function (value) {
                        
                        Draw(scope.data);
                
            
        });
        
        
       scope.$watch(function (){return attrs.data}, function (value) {
            if(angular.isUndefined(value) || !value.length || value=='undefined')
                return;
                scope.data=angular.fromJson(value);
                Draw(scope.data);
                
            
        });
             }
        }
    });
