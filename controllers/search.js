"use strict";
var elastic=require('es');
var _=require('lodash');
var async=require('async');
var region=require('../models/geographies').BoundaryRegion;
var historic=require('../models/history').History;
var db= require('../settings/database')
,   fs=require('fs')
,   queries=require('../lib/queries')
,   util=require('../lib/utils')
,   phantom=require('node-phantom');
function respond (res, json) {
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Content-Length', json.length);
	res.end(json);
}



var config={
    
    _index:'_all',
    server:{
        host:'api.urban4m.com',
        port:9200
}
};

var config_addr={
    
    _index:['_all'/*'address','zone_municipality','zone_neighborhood','zone_zipcode','area_airport','area_nationalpark','area_golf','area_water','area_landmark','area_statepark'*/],
    server:{
        host:'geo.urban4m.com',
        port:9200
}
};

var es=elastic(config);

var es_addr=elastic(config_addr);

exports.share=function(req,res){
if(!req.params.id){
        util.notfound(res);
        return;
    }
    var filename='score_card__'+req.params.id+'.png';
    fs.exists('./public/shared/images/'+filename,function(exists){
        if(exists){
            util.success(res,{success:1});
            return;
        }
        
         var url='http://localhost:'+(process.env.PORT||2600)+'/score/'+req.params.id;
    var errTimeout=null;

    phantom.create(function(error,ph){
        if(error){
            //console.log(error);
            util.notfound(res);
            return;
        }
        //console.log('phantom created');
        ph.createPage(function(err,page){
            if(err){
            //console.log(err);
            util.notfound(res);
            return;
        }
            console.log('pagecreated');
            page.set('viewportSize',{width:200,height:200},function(err){
            //console.log(err);    
            
            page.open(url,function(er,status){
               if(er){
                   // console.log(er);
                    util.notfound(res);
                    return;
                }
            //console.log('foto taken');
            
             page.render('./public/shared/images/'+filename,function(e){
                if(e) console.log(e);
                ph.exit();
                res.json({success:1,link:'shared/images/'+filename});
            });

            });
        });
        });
    });
        
    });


};



exports.log=  function (req, res) {
            //console.log(req.body);
               if(!req.body.user_term || !req.body.selected_term || !req.body.selected_term_id){
                    util.dberror(res)({error:'invalid parameters'});
                    return;
                }
                //console.log(req.params.user_term+"=["+req.params.selected_term+","+req.params.selected_term_id+"]");

                new historic({term:req.body.user_term,response:req.body.selected_term}).save().then(function(){
                   util.success(res,{success:1}); 
                },util.dberror(res));
	};



exports.search = function() {
	return function (req, res) {
              
            //console.log('hitted');
            var reqs=1;
            var addrReq=false;
            var success=false;
            var _self=this;
                var resp1=null;
                var resp2=null;
                
                function preresponde(obj){
                    respond(res, JSON.stringify(obj));
                }
                
		function iterate (collection) {
                    reqs--;
                        if(resp1)
                            resp2=collection;
                        else
                            resp1=collection;
                        if(!addrReq)
                            respond(res, JSON.stringify(collection));
                        else if(!reqs){
                            combine(preresponde);
                        }
                        
		}

		function orFail (reason) {
                    reqs--;
                        if(resp1){
                            combine(preresponde);
                            return;
                        }
			respond(res, JSON.stringify({failure: reason}));
		}

		if(!req.params.q || !req.params.q.length>1){
                    orFail('invalid query string');
                    return;
                }

                var actualQuery=(req.query.complements && req.query.complements.length)?queries.ComplementQuery(req.params.q,req.query.complements):queries.SearchQuery(req.params.q,req.params.msa);
                
                es.search(
                       actualQuery
                
                        ,
                    function(err,data){
                        if(err){
                            orFail(err);
                            return;
                        }
                        //console.log(data);
                        //console.log('got response');
                        iterate(data)
                    }
                
            );
    

              
            
            function cb(err){
                if(err){}
                   // console.log(err)
            }
            

            function combine(fn){
                
                var result={};
                if(!resp2 || !resp2.hits || !resp2.hits.total)
                    result=resp1;
                else if(!resp1 || !resp1.hits || !resp1.hits.total)
                    result=resp2;
                else{
                    _.extend(result,resp1);
                   // console.log(result);
                    result.hits.total+=resp2.hits.total;
                    async.each(resp2.hits.hits,function(item,cb){
                       // console.log(item.fields.meta_);
                        result.hits.hits.unshift(item);
                        cb();
                    },function(err){
                        if(err){}
                            //console.log(err);
                        if(_.isFunction(fn))
                            fn.call(_self,result);
                    })
                    return;
                }
                fn.call(_self,result);
                    
                
            }

	};
};


exports.address = function() {
      
	return function (req, res) {
		function iterate (collection) {
                    var result={results:collection};
                    if(partes[0])
                        result.prefix=partes[0]+' ';
                    respond(res, JSON.stringify(result));
                        
		}

		function orFail (reason) {
                    respond(res, JSON.stringify({failure: reason}));
		}

		if(!req.params.q || !req.params.q.length>1){
                    orFail('invalid query string');
                    return;
                }
                
                 var search_query={
                    "fields": ["street","city","state","zip"],
                    "query" : {
                        "bool" : {
                            "must" : [
                                { 
                                    "match" : {
                                        "_all" :'' 
                                    }
                                }
                            ], 
                            "minimum_should_match" : 0,
                            "boost" : 1.0
                        }
                    },
                    "highlight" : {
                        "fields" : {
                            "*" : {
                                "fragment_size" : 50,
                                "number_of_fragments" : 1}
                        }
                    },
                    "size":200
                };
                var partes=[];
                if(!req.params.id){
                var cad=req.params.q.trim().replace(/___/g,',');
                
                if(cad.match(/^\d/)){
                    if(cad.match(/^\d+ /)){
                        var idx=cad.search(" ");
                        partes[0]=cad.substring(0,idx);
                         partes[1]=cad.substring(idx+1);
                    }
                    else{
                        var idx=cad.search(/a-z|A-Z/);
                        
                        partes[0]=(idx>=0)?cad.substring(0,idx):cad;
                        partes[1]=(idx>=0)?cad.substring(idx):"";
                    }
                    
                }
                
                search_query.query.bool.must[0].match._all=partes[1]||cad;
                if(partes[0]){
                       search_query.query.bool.must[1]={ 
                                    "match" : {
                                        "range" :+partes[0] 
                                    }
                                }
            }
            else{
                search_query.fields.push("range");
                search_query.indices_boost={
                        "address":1.0,
                        "zone":5.0
                    }
            }
             
                }
                else if(req.params.id){
                search_query.query.bool.must[0].match={"_id":req.params.id};
                search_query.fields=["location","location.lat","location.lon","msaid"];
            }
                
                
                
                es_addr.search(search_query,
                    function(err,data){
                        
                        if(err){
                            orFail(err);
                            return;
                        }
                        if(!req.params.id){
                            iterate(data);
                            return
                        }
                        var obj=data.hits.hits[0];
                       //console.log(obj);
                        region.forge().query({where:db.knex.raw('ST_Covers(ST_Transform(shape,4326),ST_SetSRID(ST_Point('+obj.fields['location.lon']+','+obj.fields['location.lat']+'),4326))=TRUE')}).fetch({columns:["name","regionid"]}).then(function(model){
                            if(model){
                                //console.log(model);
                                data.hits.hits[0].msaid=model.get('regionid');
                                data.hits.hits[0].msa_name=model.get('name');
                            }
                             iterate(data);
                            
                        },
                        orFail
                        );
                        
                    }
                
            );

	};
};



function reverse(req, res,max) {
		function iterate (collection) {
                    var result={results:collection};
                    respond(res, JSON.stringify(result));
                        
		}

		function orFail (reason) {
                    respond(res, JSON.stringify({failure: reason}));
		}

		if(!req.params.lon || !req.params.lat){
                    orFail('invalid query string');
                    return;
                }
                
                var geoloc=req.params.lat+','+req.params.lon;
                
                var lat_idx=req.params.lat.indexOf('.');
                var lon_idx=req.params.lon.indexOf('.');
                
                 var search_query={
         "fields": ["street","city","state","zip","range"],
        "sort" : [
            {
                "_geo_distance" : {
                    "location" : geoloc,
                    "order" : "asc",
                    "unit" : "m"
                }
            }
        ],
        "query" : {
            "wildcard": {
            "location": {
                "value": req.params.lat.substr(0,lat_idx+4)+"*,"+req.params.lon.substr(0,lon_idx+4)+"*"
            }
         }
    },
    "size":200
};
//console.log('before search');
                es_addr.search(search_query
                        /*{
                            "query":{
                                "query_string":{
                                    "query":req.params.q.replace(/___/g,',')
                                }
                            },
                            "fields":["msaid","msa_name","state","name_adm1","msa_long","bbox_","meta_","address","lon","lat","location","range"]
                        }*/,
                    function(err,data){
                        
                        if(err){
                            orFail(err);
                            return;
                        }
                        iterate(data);
                    }
                
            );

	};
        
        exports.reverse=reverse;