/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


module.exports={
    SearchQuery:function(term
,msa){
    return {
        "fields": ["*" ],
    "indices_boost":{
         "lifestyle":6.0,
        "grouping":5.0,
        "subgrouping":4.0
    },
    "query" : {
        "indices": {
           "indices": [
               "lifestyle", 
              "grouping",
              "subgrouping"
           ],
           "query": {
               "term": {
                  "meta_": term
               }
           }
           , "no_match_query": {
              "bool" : {"must" : [
                    {
                        "match" : {
                            "_all" :term
                        }
                    },
                    {
                       "multi_match": {
                          "query": msa,
                          "fields": ["msaid","msa_id"]
                       }
                    }
                ],
                "boost" : 3.0
            } 
           }
        }
        },
                            /*"highlight" : {
                                "fields" : {
                                    "meta_" : {
                                        "fragment_size" : 50,
                                        "number_of_fragments" : 1
                                    }
                                }
                            },*/
                            "size":10
                        };
    
},

ComplementQuery:function(term,complement){
    complement=complement.split('___');
    complement.shift(0);
    var q={
        "fields": ["meta_" ],
    "query" : {

              "bool" : {"must" : [
                    {
                        "match" : {
                            "_all" :term
                        }
                        
                    }
                    ,
                    {
                       "multi_match": {
                          "query": 35,
                          "fields": ["msaid","msa_id"]
                       }
                    }
                ],
                "must_not":[]
               
            } 
           
        
        },
                           /* "highlight" : {
                                "fields" : {
                                    "meta_" : {
                                        "fragment_size" : 50,
                                        "number_of_fragments" : 1
                                    }
                                }
                            },*/
                            "size":10
                        };
                        
     for(var i=0;i<complement.length;i++){
         var obj={span_near:{
                clauses:[],
                slop:1,
                in_order:true
            }
        }
         var terms=complement[i].split(" ");
         for(var j=0;j<terms.length;j++)
             obj.span_near.clauses.push({span_term:{meta_:{value:terms[j].toLowerCase()}}});
         q.query.bool.must_not.push(obj);
     }                   
    console.log(JSON.stringify(q));
    return q;
    
}
}