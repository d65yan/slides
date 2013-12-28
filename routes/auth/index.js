//AUTHENTICATION PART 1//////////REDIRECTION USING THE PUBLIC TOKEN WICH IS BEING PASSED TO THE CLIENT AND LATER VERIFICATION(is passed to the client to increase signaling and keep the uer informed)
app.get('/authsuccess',function(req,res){
            res.send('200','<script>\
            parent.window.location.href="/login?vid='+req.query.vid+'"\
        </script>');
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
                      var sql0='SELECT uid FROM users WHERE uid="'+id+'"';
                      db.all(sql0,function(err,row){
                          if(err){
                              timeout();
                              throw err;
                              return;
                          }
                          var sql='';
                          if(row.length){
                            console.log('user exists');
                            msg+='Back ';
                            sql='UPDATE users SET ';
                            for(var i in user){
                                 sql+=i+'="'+user[i]+'",'
                            }
                            sql+='last_log='+llog+', cookie="'+cookie+'" WHERE uid="'+id+'"';
                          }
                          else{
                              sql='INSERT INTO users(';
                              var values=') VALUES(';
                              for(var i in user){
                                  sql+=i+',';
                                  values+='"'+user[i]+'",';
                              }
                              sql+='last_log,cookie'+llog+',"'+cookie+'")';
                          }
                          console.log(sql);
                          db.run(sql,function(err){
                              res.cookie('u4m_r0j3b', cookie);
                              res.json({msg:msg+user.name,name:user.name,success:1, token:user.token});
                              timeout(true);
                          })
                      })


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
    db.run('UPDATE users SET cookie="" WHERE uid="'+req.user.uid+'"',function(err){});
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



fs.exists('users.db',function(exists){
 
    db=new sqlite.Database('users.db',function(err){
        
        if(!exists){
            db.exec('CREATE TABLE users (uid,token,name,email,methods,last_log,cookie,plan)',function(err){
                if(err) throw err;
            })
        }
        http.createServer(app).listen(app.get('port'), function(){
            console.log("Express server listening on port " + app.get('port'));
        });
    });
    
    
    
    
})

function Verify(token,succ,fail){
    var tout=false;
    var toHandler;
     function timeout(skip){
              tout=true;
                  clearTimeout(toHandler);
           if(!skip)       
          fail();
      }




var options = {
  host: authServerURL.toString().replace('https://',''),
  port: 443,
  path: '/verify?t='+token,
  method: 'GET',
  rejectUnauthorized:false,
  headers: {}
};

var request = https.request(options, function(resp){
    console.log(resp.responseText);
        var response=resp;
        
        clearTimeout(toHandler);
        if(tout)
            return;
        resp.on('data',function(d){
            var body=d;
            try{body=JSON.parse(body);}catch(e){timeout(); console.log(e);return;}
            if(!body || !body.success){timeout(); console.log(err); return;}
            succ(response,body);
        })
       

    });


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
          delete body.success;
            var exists=false;
            var msg='Welcome ';
            var last_log=new Date().getTime();
            var ip=ip||req.headers['x-forwarded-for']|| req.connection.remoteAddress;
            var cookie=CreateCookie(body.token,last_log,ip);
            var id=body.uid;

            var sql0='SELECT uid FROM users WHERE uid="'+id+'"';
            db.all(sql0,function(err,row){
                if(err){
                    timeout();
                    throw err;
                    return;
                }
                var sql='';
                if(row.length){
                    console.log('user exists');
                    msg+='Back ';
                    sql='UPDATE users SET ';
                    for(var i in body){
                        sql+=i+'="'+body[i]+'",'
                    }
                    sql+='last_log='+last_log+', cookie="'+cookie+'" WHERE uid="'+id+'"';
                }
                else{
                    sql='INSERT INTO users(';
                    var values=') VALUES(';
                    for(var i in body){
                        sql+=i+',';
                        values+='"'+body[i]+'",';
                    }
                    sql+='last_log,cookie'+values+last_log+',"'+cookie+'")';
                }
                console.log(sql);
                db.run(sql,function(err){
                    scallback(err,body,cookie)
                    /*res.cookie('u4m_r0j3b', cookie, { expires: new Date(Date.now() + (60*60*24*365)) });
                    res.json({msg:msg+body.name,name:body.name,success:1, token:body.token});*/

                })
            })
    },function(){fcallback();/*res.json({msg:'The authentication has failed',success:0});*/})
}




////////////MIDDLEWARES/////////////////////////
function CheckCookie(req,res,next){
delete req.user;
    db.get('SELECT * FROM users WHERE cookie="'+req.cookies.u4m_r0j3b+'"',function(err,user){
        if(err || !user){
            console.log(err+' this should fail');
            return next();
        }
         var ip=ip||req.headers['x-forwarded-for']|| req.connection.remoteAddress;

        var hash=CreateCookie(user.token,user.last_log,ip);
        console.log(req.cookies);
        console.log(hash+'!='+req.cookies.u4m_r0j3b);
        if(hash===req.cookies.u4m_r0j3b)
            req.user=user;
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


