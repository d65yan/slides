
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , crypt = require('crypto')
  , http = require('http')
  , path = require('path');

var app = express();
var puerto= process.env.PORT || 2500;
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
  app.use('',express.static(path.join(__dirname, 'public')));
  //app.use(express.static(path.join(__dirname, '')));
});

var slides={
    uw:{
        name:"United Way",
        folder:"slides/uw",
        authCookie:null,
        startedtime:null,
        endingtime:null,
        lasts:2,
        password:"unitedway11-22-13"
    }
}

app.get('/',function(req, res) {
    
        res.render('index.ejs',{
                 layout:false,
                 locals:{
                    authServerURL:'',
                    user:JSON.stringify({fremium:false,premium:false,name:'test user'}),
                    logged:true
                }
        }
    );
    return;
});

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
                        token:('http://'+req.host+req.url+"?t="+req.cookies.u4mslides+"&p=uw")
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
