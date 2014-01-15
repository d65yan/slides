"use strict";

var database = require("../settings/database");

/**
 *
 *
 *
 */

var Boundary=database.readonly.extend({
		tableName : "aboutplace.geography_id",
		idAttribute : 'gid'
	});


var BoundaryRegion=database.readonly.extend({
		tableName : "aboutplace.region",
		idAttribute : 'gid',
                areas:function(){
                    return this.hasMany(BoundaryRegionArea,'regionid');
                }
	});

var BoundaryRegionArea=database.readonly.extend({
		tableName : "aboutplace.region_area",
		idAttribute : 'gid',
                region:function(){
                    return this.belongsTo(BoundaryRegion,'regionid');
                },
                cities:function(){
                    return this.hasMany(BoundaryRegionAreaCity,'areaid');
                },
                places:function(){
                    return this.hasMany(BoundaryRegionAreaPlace,'areaid');
                },
                        
                
	});



 var BoundaryRegionAreaCity=database.readonly.extend({
		tableName : "aboutplace.region_area_city",
		idAttribute :'gid',
                boundary:function(){
                    return this.hasOne(Boundary,'gid');
                },
                area:function(){
                    return this.belongsTo(BoundaryRegionArea,'areaid');
                }
            })

var BoundaryRegionAreaPlace=database.readonly.extend({ 
		tableName : "aboutplace.region_area_place",
                idAttribute :'gid',
                boundary:function(){
                    return this.hasOne(Boundary,'gid');
                },
                area:function(){
                    return this.belongsTo(BoundaryRegionArea,'areaid');
                }
	})



exports.Boundary=Boundary;
exports.BoundaryRegion=BoundaryRegion;


exports.BoundaryRegions=database.db.Collection.extend({
	model:BoundaryRegion 
                
});

exports.BoundaryRegionAreas=database.db.Collection.extend({
	model: BoundaryRegionArea
        
});

  exports.BoundaryRegionAreaCities=database.db.Collection.extend({
	model:BoundaryRegionAreaCity
        
});

exports.BoundaryRegionAreaPlaces=database.db.Collection.extend({
	model: BoundaryRegionAreaPlace
        
});



