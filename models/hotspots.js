"use strict";

var database = require("../settings/database");

var history = exports.History = database.model.extend({
	tableName: "sea.search_detail",
	idAttribute: "searchid"
});

var hotspot = exports.Hotspot = database.model.extend({
	tableName: "aboutplace.hotty",
	idAttribute: "gid",
        
});

/**
 *
 *
 *
 */
exports.Historics = database.db.Collection.extend({
	model: history
});

exports.Hotspots = database.db.Collection.extend({
	model: hotspot
});