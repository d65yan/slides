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
		idAttribute : 'id',
});




exports.rUser=ruser;
exports.wUser=wuser;


