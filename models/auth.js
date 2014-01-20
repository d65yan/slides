"use strict";

var database = require("../settings/database");

/**
 *
 *
 *
 */

var ruser=database.hreadonly.extend({
		tableName : "public.users",
		idAttribute : 'id'
	});


var wuser=database.hmodel.extend({
		tableName : "public.users",
		idAttribute : 'id'
});


var rhit=database.hreadonly.extend({
                idAttribute : 'id',
		tableName : "public.throteling"
                
	});


var whit=database.hmodel.extend({
                idAttribute : 'id',
		tableName : "public.throteling"
});



var rblacklist=database.hreadonly.extend({
		tableName : "public.blacklist"
	});


var wblacklist=database.hmodel.extend({
		tableName : "public.blacklist"
});




exports.rUser=ruser;
exports.wUser=wuser;
exports.rHit=rhit;
exports.wHit=whit;
exports.rBlack=rblacklist;
exports.wBlack=wblacklist;


