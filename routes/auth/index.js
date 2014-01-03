'use strinct';
var userWrite=require('../../models/users').userWrite,
    settings=require('../../settings/application').conf;
    var vObjQue=settings.get('vObjQue');
    var authServerURL=settings.get('authUrl'); 
    var http=require('http')
    ,keys=settings.get('keys')
    ,https=require('https')
    , sign=require('http-signature')
    ,crypto=require('crypto')
    ,mypass=settings.get('mypass');
module.exports=function(app){


//AUTHENTICATION PART 1//////////REDIRECTION USING THE PUBLIC TOKEN WICH IS BEING PASSED TO THE CLIENT AND LATER VERIFICATION(is passed to the client to increase signaling and keep the uer informed)
app.get('/authsuccess',function(req,res){
            authenticateUser(req
            ,function(err,user,cookie){
                if(err){
                                    console.log(err)
                throw err;
                res.send('200','<script>\
                    var sc=parent.window.angular.element("#upper_wrapper").scope();\
                    sc.Toast("authentication failed");\
                    sc.AuthBoxToggle("");\
                    </script>');
                   return;
                }
                res.send('200','<script>\
                    var sc=parent.window.angular.element("#upper_wrapper").scope();\
                   sc.Login('+JSON.stringify(user)+');\
                    sc.$apply();\
                    </script>');
                    return;
            },
            function(err){
                console.log(err)
                //throw err;
                res.send('200','<script>\
                    var sc=parent.window.angular.element("#upper_wrapper").scope();\
                    sc.Toast("authentication failed");\
                    sc.AuthBoxToggle("");\
                    </script>');
            })
            
});

/////SOCIAL MEDIA//////////CALL MADE BY AUTHSERVER TO INFORM THAT SOCIAL MEDIA AUTHENTICATION HAS FINISHED AND DELIVER THE RESULTS
app.post('/authresponse',CheckRequest,function(req,res){
    /*thinking to change this to a  public token and then perform a verify*/
    var user=req.body;
    console.log(JSON.stringify(user));
    var lvid=user.vid_filename;
    delete user.vid_filename;
    vObjQue[lvid].user=user;
    vObjQue[lvid].returned=true;
    res.send('ok');
})

////SOCIAL MEDIA - BRAINTREE/////////CALL MADE BY THE AUTHSERVER TO REQUEST ACTUAL INFORMATION ABOUT THE USER///////////////////////////////////////////
app.get('/auth/vid',CheckRequest,function(req,res){
    var lvid=req.query.vid;
    if(!vObjQue[lvid] || vObjQue[lvid].expired){
        res.send(401,'This operation has expired');
        return;
    }
    vObjQue[lvid].expired=true
    res.json(vObjQue[lvid]);
})

///AUTENTICATION PART 3 //////CALL MADE BY THE CLIENT WHERE IT WAITS FOR THE AUTH SERVER T VERIFY THE USER CREDENTIALS
app.get('/authenticating',
  function(req, res){
    var toHandler=null;
    var authHandler=null;
    var vid=req.query.vid;
    var token=req.get('u4m-x-auth');
    var vObject={vid:vid,started_at:new Date().getTime(),expired:false};
    if(token && token.length)
        vObject.token=token;
    vObjQue[vid]=vObject;
      function timeout(skip){
                  clearTimeout(authHandler);
                  clearTimeout(toHandler);
                  delete vObjQue[vid];
           if(!skip)       
          res.json({msg:'The authentication has failed',success:0});
      }

          
      function authenticated(){

          console.log('checking for Object '+vid);
              if(vObjQue[vid].returned){
                  console.log('Clearing Timers');
                  clearTimeout(authHandler);
                  clearTimeout(toHandler);
                  //res.json({msg:'file found'});

                      var user= vObjQue[vid].user;
                      if(user.error){
                          timeout();
                          return;
                      }

                      var exists=false;
                      var llog=new Date().getTime();
                      var msg='Welcome ';
                      var cookie=CreateCookie(user.token,llog,user.ip);
                      delete user.ip;
                      var id=user.uid
                      //delete user.uid;
                      userWrite.forge({id:uid}).fetch().then(function(ruser){
                              if(ruser){
                                  for(var i in user)
                                    ruser.set(i,user[i]);
                              }
                              else{
                                  ruser= userWrite.forge(user);
                              }
                              ruser.save().then(function(nuser){
                                  res.cookie('u4m_r0j3b', cookie);
                                  res.json({msg:msg+user.name,name:user.name,success:1, token:user.token});
                                  timeout(true);
                              },
                              function(err){
                                  timeout();
                                  throw err;
                                  return;
                              })
                      });
                      
                      

              }
              else{
                  clearTimeout(authHandler);
                  authHandler=setTimeout(function(){
                      authenticated();
                  },200)
              }

      }
      
      
    toHandler=setTimeout(function(){
        timeout();
    },60000);
    
    
    authenticated();
  });

app.get('/logout',CheckCookie,function(req,res){
    if(!req.user){
        res.send('404','');
        return;
    }
    userWrite.forge({id:uid}).set('cookie',null).save();
    res.cookie('u4m_r0j3b',null,{expires:new Date(Date.now()-90000)});
    res.send('ok');
})


setInterval(function(){
    var now=new Date().getTime();
    for(var i in vObjQue){
        var diff=now-vObjQue[i].started_at;
        if(diff>3000){
           vObjQue[i].expired=true; 
        }
        else if(diff>65000)
            delete vObjQue[i];
    }
},1000);



function Verify(token,succ,fail){
    console.log('going to verify');
    var tout=false;
    var toHandler;
     function timeout(skip){
              tout=true;
                  clearTimeout(toHandler);
           if(!skip)       
          fail();
      }

var auth_url=authServerURL.toString().split(':');
var url=auth_url[1].toString().replace('//',''),
port=auth_url[2]||2300;
var options = {
  host: url,//.replace('https://',''),
  //port: 443,
  port:port,
  path: '/verify?t='+token,
  method: 'GET',
  //rejectUnauthorized:false,
  headers: {}
};


console.log(url+'--->'+port);

var request = http/*s*/.request(options, function(resp){
        var response=resp;
        
        clearTimeout(toHandler);
        if(tout)
            return;
        resp.on('data',function(d){
             
            var body=JSON.parse(d);
            console.log(body.success);
            //try{body=body);}catch(e){timeout(); console.log(e);return;}
            if(!body || !body.success){timeout(); console.log('err'); return;}
            succ(response,body);
        })
        

       

    });

        request.on('error',function(err){
            console.log(err)
            //throw err;
            fail(err);
        })

sign.sign(request, {
  key: keys.key,
  keyId: 'key'
});

request.end();


   toHandler=setTimeout(function(){timeout();},60000);
};

function CreateHash(url){
    var hmac= new crypto.createHmac('sha512',mypass);
    hmac.update(url);
    var hash=hmac.digest('hex');
    return hash;
}

function CreateCookie(token,llog,ip){
   console.log(token);
   console.log(ip);
   console.log(llog);
   var hash= CreateHash(token+'_'+ip+'_'+llog);
   return hash;
}
function StashIt(vid,token){
    vid=vid||CreateHash(Math.ceil(Math.random()*1000000000)+'_'+Date.now());
    var vObject={vid:vid,started_at:new Date().getTime(),expired:false};
    if(token && token.length)
        vObject.token=token;
    vObjQue[vid]=vObject;
    return vid
}

function Undust(key){
    if(!vObjQue[key])
        return false;
    return vObjQue[key];
}


function authenticateUser(req,scallback,fcallback){
     Verify(req.query.vid,function(response,body){
         console.log('succesfull response')
          delete body.success;
          var ms=body.member_since;
          var ll=body.last_log;
          delete body.member_since;
          delete body.last_log;
            var exists=false;
            var msg='Welcome ';
            var last_log=new Date().getTime();
            var ip=ip||req.headers['x-forwarded-for']|| req.connection.remoteAddress;
            var cookie=CreateCookie(body.token,last_log,ip);
            var id=body.id;

                      userWrite.forge({token:body.token}).fetch().then(function(ruser){
                              if(ruser){
                                  for(var i in body)
                                    ruser.set(i,body[i]);
                                    exists=true;
                                }
                              else{
                                  ruser= userWrite.forge(body);
                              }
                              ruser.save().then(function(nuser){
                                  body.new=!exists;
                                   scallback(null,body,cookie)
                              },
                              function(err){
                                  scallback(err);
                              })
                      });
            
    },function(){fcallback();/*res.json({msg:'The authentication has failed',success:0});*/})
}




////////////MIDDLEWARES/////////////////////////
function CheckCookie(req,res,next){
delete req.user;
    userWrite.forge({cookie:req.cookies.u4m_r0j3b}).fetch().then(function(user){
        var ip=ip||req.headers['x-forwarded-for']|| req.connection.remoteAddress;

        var hash=CreateCookie(user.get('token'),user.get('last_log'),ip);
        console.log(req.cookies);
        console.log(hash+'!='+req.cookies.u4m_r0j3b);
        if(hash===req.cookies.u4m_r0j3b)
            req.user=user;
        return next();
    },function(err){
         console.log(err+' this should fail');
         return next();
    })
}

function CheckRequest(req,res,next){
    var parsed = sign.parseRequest(req);
  console.log(keys.cert);
  if (!sign.verifySignature(parsed, keys.cert)){
      console.log('header verification failed');
    res.send('403','Forbidden');
    return;
  }
  
  console.log('header verified');
  return next();
    
}
}


