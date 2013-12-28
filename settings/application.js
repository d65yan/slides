exports.conf = require("nconf")
	.argv()
	.env()
	.file({ file: './app/settings.json' })
	.file('package', { file: './package.json' })
        .defaults({
            DBFILE:'./db/mydb.db',
            DEBUG:true
        })
;
