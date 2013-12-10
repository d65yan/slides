
  angular.module('customFiltersModule',[])
  .filter('getByname',function(){
    return function(arr,name){
        if(angular.isUndefined(arr) || !arr.length)
            return[];
        if(angular.isUndefined(name) || name.length==0)
            return arr;
        var temp=[];
        temp=arr;
        var results=[];
        for(var i=0;i<temp.length;i++){
            if(temp[i].name.toString().toUpperCase().match(name.toString().toUpperCase())){
                results.push(temp[i]);
            }
        }
        return results;
    };
})
.filter('notIn',function(){
    return function(rets,args){
        var field=args[0];
        var group=[];
        group=angular.copy(args[1],group);
        if(angular.isUndefined(rets) || !rets.length)
            return[];

        var results=[];
        for(var h=0; h<rets.length;h++){
            var esta=false;
            for(var i=0; i<group.length;i++){
                if(group[i][field]===rets[h][field]){
                    esta=true;
                    break;
                }
            }
            if(esta)
                continue
            var obj={};
            obj=angular.extend(obj,rets[h]);
            results.push(obj);
        }
        return results;
    };
}).filter('sliderValues',function(){
    return function(value){

        if(angular.isUndefined(value))
            return'';

        var val=value.toString().replace(/\..*/g,'');
        
        return val;
    };
});