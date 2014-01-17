
/**
 * Module dependencies.
 */


var express = require('express')
  , routes = require('./routes')
  , lifestyle=require('./controllers/lifestyles')
  , crypt = require('crypto')
  , http = require('http')
  , path = require('path')
  , db=require('./settings/database').db
  , search=require('./controllers/search')
  , hotspots=require('./controllers/hotspots')
  , util=require('./lib/utils')
  , settings=require('./settings/application').conf
  ;

var app = express();
var puerto= process.env.PORT || 2600;
app.configure(function(){
  app.set('port',puerto);
  app.set('views', __dirname + '/public');
 // app.set('views', __dirname + '/public/uw');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.favicon(__dirname + '/public/images/favicon.ico')); 
  app.use('',express.static(path.join(__dirname, 'public/')));
  //app.use(express.static(path.join(__dirname, '')));
});
var authUrl=settings.get('authUrl'); 

//console.log('URL ===>'+set.get('DBFILE'));

var slides={
    uw:{
        name:"United Way",
        folder:"slides/uw",
        authCookie:null,
        startedtime:null,
        endingtime:null,
        lasts:2,
        password:"unitedway112213"
    },
        fd:{
        name:"Federation",
        folder:"slides/fd",
        authCookie:null,
        startedtime:null,
        endingtime:null,
        lasts:2,
        password:"federation121113"
    }
}


require('./routes/auth')(app);

app.get('/',util.attachAuthCookies,function(req, res) {
    
   
       res.render('index.ejs',{
                 layout:false,
                 locals:{
                    authServerURL:authUrl,
                    user:JSON.stringify(req.user)
                }
        }
    );
    return;
});

app.get('/api/search/:q/:msa',util.sanitize,search.search());
app.post('/api/search',util.sanitize,search.log);
app.get('/api/share/:id',util.sanitize,search.share);
app.get('/api/address/:q',util.sanitize,search.address());
app.get('/api/address/:q/:id',util.sanitize,search.address());
app.get('/api/reverse/:lon/:lat',util.sanitize,search.reverse);
app.get('/api/hotspot/:id',util.sanitize,hotspots.state);
app.post('/api/hotspot',util.sanitize,hotspots.hotspot);
app.get('/api/lifestyles',util.sanitize,require('./controllers/uimenu').GetMenu);
app.get('/score/:id',util.sanitize,hotspots.score);

/*app.get('/api/address/:q',routes.address);
app.get('/api/hotspot/:id',routes.state);*/

app.get(/\/slides\/[a-z]+/,function(req, res) {
        
        if(req.query.t)
        {
            res.cookie('u4mslides',req.query.t,{httpOnly:true,secure:false});
            res.redirect('/slides/'+req.query.p+'/')
            res.send('302','<br>');
            return;
        }
        
        var lpath=req.path.replace(/^\/|\/$/g,'').split('/');
        var index=lpath.indexOf('slides');
        index++;
        var redirect=false;
        var path=lpath[index];
        if(path=='core'){
            res.sendfile('public/'+req.url);
            return;
        }
        var cooky=req.cookies.u4mslides;
        if(slides[path]){
           if(cooky!=null && cooky.length && cooky===slides[path].authCookie && Date.now()<slides[path].endingtime){
               

               
            if(lpath.length!==2){
                 res.sendfile('public/'+req.url);
                return;
            }
            if(index===lpath.length-1 || (index+1===lpath.length-1 && !lpath[index+1].length)){
                    
                res.render(slides[path].folder+'/index.ejs',{
                    layout:false,
                    locals:{
                        token:('http://'+req.host+req.url+"?t="+req.cookies.u4mslides+"&p="+path)
                    }
                });
                res.end();
                
            }
           }
           else
               redirect=true;
            
        }
        else
               redirect=true;
        
        if(redirect){
           res.redirect('/slides/');
           res.send('302','<br>');
        }
    return;
});

app.get(/\/slides\/*$/,function(req,res){
            res.render('slides/index.ejs',{
                 layout:false,
                 locals:{
                    
                }
        });
})

app.post(/\/slides\/*$/,function(req,res){
    if(req.body.password && req.body.password.length>5 && (!req.cookies.attempts || req.cookies.attempts<3)){
       for(var i in slides){
           if(slides[i].password===req.body.password){
               var cooky=slides[i].authCookie;
               if(!slides[i].endingtime || slides[i].endingtime<=Date.now()){
                   var shasum = crypt.createHash('sha1');
                   shasum.update(Math.random()*100000000000000+"_"+Date.now());
                   cooky=shasum.digest('hex');
                   slides[i].authCookie=cooky;
                   slides[i].startedtime=Date.now();
               }
               slides[i].endingtime=slides[i].startedtime+(slides[i].lasts*60*60*1000);
               res.cookie('u4mslides',cooky,{httpOnly:true,secure:false});
               res.redirect('slides/'+i+'/');
               res.send('302','<br>');
               res.end();
               return;
           }
       } 
    }
    res.cookie('attempts',+req.cookies.attempts+1,{expires:new Date(Date.now()+(60*60*24*365*10)),httpOnly:true,secure:false});
    res.redirect('/slides/');
    res.send('302','<br>');
})

      http.createServer(app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
        });
