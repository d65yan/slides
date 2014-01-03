var fs=require('fs');
var conf = require("nconf")
	.argv()
	.env()
	.file({ file: './settings/application.json' })
	.file('package', { file: './package.json' })
        .defaults({
            DBFILE:'./db/mydb.db',
            DEBUG:true
        });

var keys=conf.get('keys');
conf.set('keys',
{
    key:fs.readFileSync(keys.key,'ascii'),
    cert:fs.readFileSync(keys.cert,'ascii')
})
exports.conf=conf;