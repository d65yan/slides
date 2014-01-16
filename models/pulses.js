"use strict";

var database = require("../settings/database");

var pulse = exports.Pulse = database.model.extend({
	tableName: "aboutplace.scorecard",
});
/**
 *
 *
 *
 */
exports.Pulses = database.db.Collection.extend({
	model: pulse
});
