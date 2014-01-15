"use strict";

var database = require("../settings/database");

/**
 *
 *
 *
 */

var ruser=database.readonly.extend({
		tableName : "sea.user",
		idAttribute : 'id'
	});


var wuser=database.model.extend({
		tableName : "a.user",
		idAttribute : 'gid',
                areas:function(){
                    return this.hasMany(BoundaryRegionArea,'regionid');
                }
	});




exports.rUser=ruser;
exports.wUser=wuser;


