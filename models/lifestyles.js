"use strict";

var database = require("../settings/database");

var Lifestyle = database.readonly.extend({
	tableName: "aboutplace.lifestyle",
	idAttribute: "lifestyleid",
        /*subgroups:function(){
            return this.hasMany(SubGroup).through(Group)
        },*/
        groups:function(){
            return  this.belongsToMany(Group,'lifestyle_grouping_subgroup','lifestyleid','groupid')
        },
        subgroups:function(){
            return  this.hasMany(LifestyleGrouping,'lifestyleid')
        }
});

var Group = database.readonly.extend({
	tableName: "aboutplace.grouping",
	idAttribute: "groupid",
        lfssubgroups:function(){
            return  this.hasMany(SubGroup,'lifestyle_grouping_subgroup','groupid','subgroupid')
        },
        subgroups:function(){
            return  this.belongsToMany(SubGroup,'grouping_subgroup','groupid','subgroupid')
        }
});

var SubGroup = database.readonly.extend({
	tableName: "aboutplace.subgrouping",
	idAttribute: "subgroupid"
});

var LifestyleGrouping = database.readonly.extend({
	tableName: "aboutplace.lifestyle_grouping_subgroup",
        lifestyle:function(){
            return this.belongsTo(Lifestyle,'lifestyleid','lifestyleid');
        },
        group:function(){
            return this.belongsTo(Group,'groupid','groupid');
        }
	//lifestyle
});

var LifestyleSubgroup = database.readonly.extend({
	tableName: "aboutplace.lifestyle_subgroup",
	//lifestyle
});

exports.Lifestyle = Lifestyle;
exports.Group = Group;
exports.SubGroup = SubGroup;

/**
 *
 *
 *
 */
exports.Lifestyles = database.db.Collection.extend({
	model: Lifestyle,
	comparator: 'lifestyle_name'
});

exports.Groups = database.db.Collection.extend({
	model: Group,
	comparator: 'group_name'
});


exports.SubGroups = database.db.Collection.extend({
	model: SubGroup,
	comparator: 'subgroup_name'
});



