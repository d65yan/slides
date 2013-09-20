
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 2500);
  app.set('views', __dirname + '/public');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.favicon(__dirname + '/public/images/favicon.ico')); 
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, '')));
});



app.get('/',function(req, res) {
    
        res.render('index.ejs',{
                 layout:false,
                 locals:{
                    authServerURL:'',
                    user:JSON.stringify({fremium:false,premium:false,name:'test user'}),
                    logged:true
                }
        });
    return;
});

      http.createServer(app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
        });
