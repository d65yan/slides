"use strict";
var _=require('lodash');
var async=require('async');
var historic=require('../models/hotspots').History;
var hotspot=require('../models/hotspots').Hotspot;
var hSpots=require('../models/hotspots').Hotspots;
var database=require('../settings/database')
var util=require('../lib/utils');


function hotspots(){
   return{
    "hotspots":[
        {
            "pulse":(Math.random()*10).toFixed(1),
            "gid":1,
            "name":"Brickel",
            "center":{
                "lon":"-80.19546",
                "lat":"25.77368"
            },
            scorecard:[
                {
                    id:'hp',
                    name:'Avg Housing Price',
                    value:'$2000',
                    rank:6
                },
                {
                    id:'edu',
                    name:'Avg Education',
                    value:'College Degree',
                    rank:6
                },
                {
                    id:'age',
                    name:'Avg Age',
                    value:38,
                    rank:6
                },
                {
                    id:'walk',
                    name:'Walkability',
                    value:'High',
                    rank:10
                },
                {
                    id:'mtrans',
                    name:'Mass transit',
                    value:'Poor',
                    rank:2
                }
            ]
        },
        {
            "pulse":(Math.random()*10).toFixed(1),
            "gid":2,
            "name":"Miami Beach",
            "center":{
                "lon":"-80.13572",
                "lat":"25.78635"
            },
            scorecard:[
                {
                    id:'hp',
                    name:'Avg Housing Price',
                    value:'$2200',
                    rank:6
                },
                {
                    id:'edu',
                    name:'Avg Education',
                    value:'College Degree',
                    rank:6
                },
                {
                    id:'age',
                    name:'Avg Age',
                    value:38,
                    rank:6
                },
                {
                    id:'walk',
                    name:'Walkability',
                    value:'High',
                    rank:10
                },
                {
                    id:'mtrans',
                    name:'Mass transit',
                    value:'Poor',
                    rank:2
                }
            ]
        }/*,
        {
            "pulse":(Math.random()*10).toFixed(1),
            "gid":3,
            "name":"Hialea",
            "center":{
                "lon":"-80.2785921",
                "lat":"25.848624"
            },
            "neighborhoods":[
                {
                    "name":"Municipality 4",
                    "pulse":3.2,
                    "gid":6
                },
                {
                    "name":"Municipality 5",
                    "pulse":2.8,
                    "gid":7
                },
                                {
                    "name":"Municipality 6",
                    "pulse":2.5,
                    "gid":8
                }
            ]
        }*/
           
        
    ]       
}
};


exports.hotspot =  function (req, res) {
    var b=req.body.bounds;
    var bounds="array["+b.left+","+b.bottom+","+b.right+","+b.top+"]";
    var syst='array[';
    
    for(var i =0;i<req.body.actualSystems.length;i++)
        syst+=req.body.actualSystems[i]+',';
    syst=syst.substr(0,syst.length-1)+']';
    //+JSON.stringify(req.body.actualSystems).replace('\"',"'");
    database.db.knex.raw('select * from aboutplace.scorecard('+bounds+','+syst+') limit 3;').then(function(collection){
        new historic({msaid:req.body.msa,lifestyleid:req.body.lifestyle,query:JSON.stringify(req.body)}).save().then(function(model){
                new historic({searchid:model.get('searchid')}).fetch({columns:['shortname']}).then(function(model){
                            var h=hotspots();
                            h.hotspots.sort(function(b,a){return((a.pulse-b.pulse)/Math.abs(a.pulse-b.pulse))});
                            h.historic_id=model.get('shortname');
                            util.success(res,h);
                },util.dberror(res));
                    
                
            },util.dberror(res));
    },
    util.dberror(res)
    )
    

            
	
};


exports.state=function (req, res) {
	new historic({shortname:req.params.id}).fetch().then(function(model){
            model.set('hotspots',hotspots().hotspots.sort(function(b,a){return((a.pulse-b.pulse)/Math.abs(a.pulse-b.pulse))}));
            util.success(res,model);
        },util.dberror(res));
 }

exports.score=function(req,res){
    res.render('scorecard.ejs',{
          layout:false
    });
}