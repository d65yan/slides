AP.animation('.move-view', function($rootScope,$timeout) {
    //return {};
    var h=$(window).innerHeight()-$('header').outerHeight();
    
var anim={
    enter : function(element, done) {
        var srcObj=destObj={};
        if(!$rootScope.back){
            if(!$rootScope.same){
                srcObj={'position':'absolute','left':'110%','top':'0px'};
                destObj={'left':'0px'};
            }
            else{
                srcObj={'position':'absolute','top':'100%','left':'0px'};
                destObj={'top':'0px'};
            }
        }
        else{
            if(!$rootScope.same){
               srcObj={'position':'absolute','left':'-110%','top':'0px'};
                destObj={'left':'0px'}; 
            }
            else{
                srcObj={'position':'absolute','top':'-100%','left':'0px'};
                destObj={'top':'0px'}; 

            }
        }
        
        $('#main_view_wrapper').css({"height":h+"px","overflow":"hidden","position":"relative"})
        
        $(element).css(srcObj);
        $(element).animate(destObj,800,function(){
               $(element).removeAttr('style');
                $('#main_view_wrapper').removeAttr('style');
               $timeout(function(){$rootScope.$broadcast('viewAnimEnd')});
        });
        
    },
    leave : function(element, done) {
         $('#upper_wrapper').animate({'scrollTop':'0'}); 
        var srcObj=destObj={};
        if(!$rootScope.back){
            if(!$rootScope.same){
                srcObj={'position':'absolute','left':'0px','top':'0px'};
                destObj={'left':'-110%'};
            }
            else{
                srcObj={'position':'absolute','left':'0px','top':'0px'};
                destObj={'top':'-100%'};
            }
        }
        else{
           if(!$rootScope.same){
           srcObj={'position':'absolute','left':'0px','top':'0px'};
            destObj={'left':'110%'}; 
           }
           else{
           srcObj={'position':'absolute','left':'0px','top':'0px'};
            destObj={'top':'100%'}; 
               
           }
        }
        $('#main_view_wrapper').css({"height":h+"px","overflow":"hidden"})
        $(element).css(srcObj);
        $(element).animate(destObj,800,function(){
              element.remove();
              $('#main_view_wrapper').removeAttr('style');
        });
    }

  };


  return anim;
});
