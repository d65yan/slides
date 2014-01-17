"use strict";

var database = require("../settings/database");

/**
 *
 *
 *
 */

var rhit=database.hreadonly.extend({
		tableName : "public.users",
		idAttribute : 'id'
	});


var whit=database.hmodel.extend({
		tableName : "public.users",
		idAttribute : 'id'
});




exports.rHit=rhit;
exports.wHit=whit;


