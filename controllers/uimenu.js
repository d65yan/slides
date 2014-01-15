"use strict";
var elastic=require('es');
var _=require('lodash');
var async=require('async');
var when=require('when')
,   util=require('../lib/utils')
, _=require('lodash');


function GetConf(idx){
return {
        _index:(idx||'lifestyle'),
        server:{
            host:'api.urban4m.com',
            port:9200
        }
    };
}
var grEs=elastic(GetConf('grouping'));
var sgEs=elastic(GetConf('subgrouping'));
var lfEs=elastic(GetConf());

exports.GetMenu =  function (req, res) {
              
            console.log('hitted');
            
//                {
//                            "query":{
//                                "query_string":{
//                                    "query":req.params.q
//                                }
//                            },
//                            "fields":["meta_"]
//                        }
                var grpPromise=when.defer();
                var subPromise=when.defer();
                var lfsPromise=when.defer();
                grEs.search(
                        {"fields": ["*" ],"size":2000},
                    function(err,data){
                        if(err){

                            grpPromise.reject(new Error(err));
                            return;
                        }

                        var grouping=data.hits.hits;
                        var it=function(){};
                        var groups=[];
                        async.each(grouping, function(item,it){
                            
                            var gobj={
                                group_name:item.fields.meta_,
                                groupid:item._id,
                                subgroups:(_.isArray(item.fields.subgroups)?item.fields.subgroups:[item.fields.subgroups])
                            };
                            groups.push(gobj);
                            
                            it();
                        },function(err){
                            if(err){
                                grpPromise.reject(new Error(err));
                                return;
                            }
                            grpPromise.resolve(groups);
                            
                        });
                        
                    }
                
            );
    
            grpPromise.promise.then(function(groups){
                var lg=groups;
                sgEs.search(
                        { "fields": ["*" ],"size":2000},
                    function(err,data){
                        if(err){
                            subPromise.reject(new Error(err));
                            return;
                        }
                        
                        var sub=data.hits.hits;
                        var it=function(){};
                        async.each(sub, function(item,it){
                            for(var i=0;i<lg.length;i++){
                                var idx=lg[i].subgroups.indexOf(+item._id);
                                if(idx<0)
                                    continue;
                                lg[i].subgroups[idx]={subgroup:{subgroup_name:item.fields.meta_,subgroupid:item._id}}
                            }
                            it();
                        },function(err){
                            if(err){
                                subPromise.reject(new Error(err));
                                return;
                            }
                            
                            subPromise.resolve(lg);
                            
                        });
                        
                    }
                
            );
            },util.dberror(res));
            
            
           subPromise.promise.then(function(llg){
               var lg=llg;
                lfEs.search(
                        {"fields": ["*" ],"size":20},
                    function(err,data){
                        if(err){
                            lfsPromise.reject(new Error(err));
                            return;
                        }
                        
                        var lfs=data.hits.hits;
                        var menu={
                            lifestyles:[],
                            groups:lg
                        };
                        var it=function(){};
                        async.each(lfs, function(item,it){
                                var lobj={
                                    lifestyle_name:item.fields.meta_,
                                    lifestyleid:item._id,
                                    subgroups:(_.isArray(item.fields.subgroups)?item.fields.subgroups:[item.fields.subgroups])
                                };
                                
                                menu.lifestyles.push(lobj);
                            
                            it();
                        },function(err){
                            if(err){
                                lfsPromise.reject(new Error(err));
                                return;
                            }
                            lfsPromise.resolve(menu);
                            
                        });
                        
                    }
                
            );
            },
                util.dberror(res)
            );
            
            
            
            
            
            
             lfsPromise.promise.then(function(menu){
                    util.success(res,menu);
                },
                util.dberror(res)
            );
};  
 