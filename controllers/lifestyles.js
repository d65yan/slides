"use strict;"

var lifestyle=require('../models/lifestyles').Lifestyle
,   lifestyles=require('../models/lifestyles').Lifestyles
,   group=require('../models/lifestyles').Group
,   groups=require('../models/lifestyles').Groups
,   subgroup=require('../models/lifestyles').SubGroup
,   subgroups=require('../models/lifestyles').SubGroups
,   util=require('../lib/utils');

exports.GetFullMenu=function(req,res){
    var lfs=new lifestyles();
            lfs.fetch({withRelated:["groups", "groups.subgroups"]}).then(
            function(col){
                console.log('already responded');
                util.success(res,{lifestyles:col})
            },
            util.dberror
    );
}


exports.GetSplittedMenu=function(req,res){
    var lfs=new lifestyles();
            lfs.fetch({
                withRelated:[
                    {
                        "subgroups":function(qb){
                           // qb.column("subgroupid");
                        }
                    }
                ]
            }
             ).then(
            function(lfss){
                console.log('already responded');
                var lgroups=new groups();
                lgroups.fetch({withRelated:"subgroups"}).then(
                        function(gps){
                            util.success(res,{groups:gps,lifestyles:lfss})
                        },
                            util.dberror
                
                        )
                
            },
            util.dberror
    );
}