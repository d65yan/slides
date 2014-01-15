"use strict";

var database = require("../settings/database");

var history = exports.History = database.model.extend({
	tableName: "sea.search_history",
	idAttribute: "searchid"
});

/**
 *
 *
 *
 */
exports.Historics = database.db.Collection.extend({
	model: history,
	comparator: 'term'
});
