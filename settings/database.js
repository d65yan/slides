"use strict";

var settings = require('./application').conf
, Bookshelf = require("bookshelf")
, Fields = require("bookshelf-fields")
, fs=require('fs');


exports.fields=Fields;

var db = exports.db = Bookshelf.DB = Bookshelf.initialize({
client: "pg",
	debug: settings.get("DEBUG"),
	connection: {
		host: settings.get("PGHOST"),
		database: settings.get("PGDATABASE"),
		user: settings.get("PGUSER")
	}
});

var udb = exports.udb = Bookshelf.UDB = Bookshelf.initialize({
client: "pg",
	debug: settings.get("DEBUG"),
	connection: {
		host: settings.get("PGHOST1"),
		database: settings.get("PGDATABASE1"),
		user: settings.get("PGUSER1"),
                password: settings.get("PGPASS1"),
                ssl:true
	}
});


db.plugin(Fields.plugin);

var Model= db.Model.extend({});
exports.model = Model;

/**
 *
 *
 *
 */
exports.readonly = Model.extend({
	allowedToEdit: function () {
		return false;
	}
});

//////////////////////////////////////////
var hModel= udb.Model.extend({});
exports.hmodel = hModel;

/**
 *
 *
 *
 */
exports.hreadonly = hModel.extend({
	allowedToEdit: function () {
		return false;
	}
});


exports.knex=db.knex;

//console.log('con-->',db.knex.client.pool);

var sch=db.knex.schema;
/*sch.hasTable('users').then(function(exists){
    if(!exists){
        sch.createTable('users',function(table){
            table.bigIncrements('id').primary().unique().notNullable().index();
            table.string('email').unique().notNullable().index();
            table.json('methods').notNullable();
            table.string('token').unique().notNullable().index;
            table.string('f_name').notNullable();
            table.string('l_name');
            table.string('plan');
            table.string('cookie');
             
            
        }).then(function(){
             console.log('users table created');
        })
         console.log('need to create users table');
       
    }
    else
        console.log('users table exists');
})*/
    
