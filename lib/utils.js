var conf=require('../settings/application').conf
,   rUser=require('../models/auth').rUser
,   wUser=require('../models/auth').wUser
,   rHits=require('../models/auth').rHits
,   wHits=require('../models/auth').wHits
;

    var xname=conf.get('CSRF_COOKIE_NAME');
    var tname=conf.get('TRACKCOOKIE');
    
var respond=function(res,json){
        json=JSON.stringify(json);
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Content-Length', json.length);
	res.end(json);
}



var sanitize=function(req,res,next){
   

    var csfr=req.get(xname);
    var t= req.get('TOKEN');
    rUser.forge({token:t}).fetch().then(function(user){
        console.log(JSON.stringify(user));
            if(!user/* || csfr!=user.get('csfr_cookie')*/){
                util.unauthorized(res);
                return;
            }
            //res.cookie(xname,createCookie(t),{httpOnly:true,secure:false});
            return next();
    
    })
    
    
}


var onlyRegistered=function(req,query,next){
    return next();
    if(!req.user.token || req.get(token)!=req.user.token){
        util.unauthorized(res);
        return;
    }
        
}

var limit=function(name,towait,limit){
    
    var apiName=name;
    var apLimit=limit;
    
    return function(req,query,next){
        return next();
        
        
        if(!limitApis || !limitApi[apiName])
            return next();
        
        if(blackList[request.connection.remoteAddress])
            util.banned(res);
        
        var date=Date.now();
        limitApi[apiName][req.user.track].count++;
       if((date-limitApi[apiName][req.user.track].lastHit)<towait){
           limitApi[apiName][req.user.track].lastHit=date;
           util.notfound(res)
           return;
       }
       
       if((date-limitApi[apiName][req.user.track].mark)>=60000){
           limitApi[apiName][req.user.track].mark=date;
           if(limitApi[apiName][req.user.track].count>limit){
               blackList[request.connection.remoteAddress]=req.user.track;
           }
               
       }
       
       return next();
           
    }
}

var checkauthcooky=function(req,res,next){
    //return next();

     var whatif=function(){
         
    wUser.forge().save().then(function(user){
        if(!user){
            util.dberror(res);
            return;
        }
        var t=createTracking(user.id);
        var c=createCookie(t);
        user.set({token:t,csfr_cookie:c}).save().then(function(ouser){
             if(!ouser){
                util.dberror(res);
                return;
            };
            req.user=ouser;
            user.unset(xname);
            user.unset('id');
            res.cookie(tname,t,{httpOnly:true,secure:false});
            res.cookie(xname,c,{httpOnly:true,secure:false});
            return next();
        },
        util.dberror(res));
       
        
            
    },util.dberror(res));
     }


     if(req.cookies[tname]){
         rUser.forge().query({where:{token:req.cookies[tname]}}).fetch().then(function(user){
             if(!user){
                 whatif();
                 return;
             }
             if(!user.get('uid')){
                
                 req.user={token: user.get('token')};
                 
                 var c=createCookie(req.cookies[tname]);
                 user.set('csfr_cookie',c).save();
                 res.cookie(xname,c,{httpOnly:true,secure:false});
                 next();
             }
             else
                 next();
         })
     }
    else{
        whatif();
        
    }
    


}






var util={
    success:respond,
    dberror:function(res){
        var resp=res;
        return function(reason){
            resp.statusCode=409;
            respond(resp,reason);
        }
    },
    notfound:function(res){
        res.statusCode=404;
        res.end('Item not found');
    },
    unauthorized:function(res){
        res.statusCode=403;
        res.end('Unauthorized Access');
    },
    sanitize:sanitize,
    attachAuthCookies:checkauthcooky
};

module.exports=util;

var createCookie=function(token){
    return 'cooky_'+Date.now()+'_'+Math.random();
}

var createTracking=function(id){
    return 'track_'+Date.now()+'_'+Math.random();
}

var createToken=function(){
    return 'token_'+Date.now()+'_'+Math.random();
}