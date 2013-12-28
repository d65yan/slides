'use strict';


var wModel=require('../settings/database').model
, rModel=require('../settings/database').readonly
, fields=require('../settings/database').fields
, db=require('../settings/database').db; 


var rUser= rModel.extend({
    tableName:'users',
    idAttribute:'id',
    
});

var wUser= wModel.extend({
    tableName:'users',
    idAttribute:'id',
    
});



fields.fields(rUser,
[fields.intField,'id'],
[fields.emailField,'email'],
[fields.jsonField,'methods'],
[fields.stringField,'token'],
[fields.stringField,'f_name'],
[fields.stringField,'l_name'],
[fields.stringField,'plan'],
[fields.dateTimeField,'member_since'],
[fields.dateTimeField,'last_visit']
)

fields.enable_validation(wUser);
fields.fields(wUser,
[fields.intField,'id'],
[fields.emailField,'email'],
[fields.jsonField,'methods'],
[fields.stringField,'token'],
[fields.stringField,'f_name'],
[fields.stringField,'l_name'],
[fields.stringField,'plan'],
[fields.dateTimeField,'member_since'],
[fields.dateTimeField,'last_visit']
)

exports userRead=rUser;
exports userWrite=wUser;
exports.users=db.Collection.extend({model:wUser});