/**
 * generate sparql command, query on DBpedia by ajax
 * Created by Yongshuo on 19/05/2017.
 */
function getInfo(name,image,callback){
    var endpoint = "http://dbpedia.org/sparql";
    
    var command = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
                  +"PREFIX foaf: <http://xmlns.com/foaf/0.1/> "
                  +"PREFIX dbo: <http://dbpedia.org/ontology/> "
                  +"SELECT ?SoccerPlayer ?name ?position ?clubname ?birthday ?height ?number "
                  +"WHERE{"
                  +"{"
                    +"?SoccerPlayer dbp:name \""+name+"\"@en ;"
                                        +"a dbo:SoccerPlayer ."
                    +"?SoccerPlayer dbp:name ?name ."
                    +"?SoccerPlayer dbp:position ?position ."
                    +"?SoccerPlayer dbo:birthDate ?birthday ."
                    +"?SoccerPlayer dbo:height ?height ."
                    +"?SoccerPlayer dbo:number ?number ."
                    +"?SoccerPlayer dbp:clubs ?clubs ."
                    +"?clubs dbp:clubname ?clubname ."
                    +"FILTER(?clubname IN(\"Chelsea\"@en,\"Tottenham Hotspur\"@en,\"Manchester City\"@en"
                    +",\"Manchester United\"@en,\"Arsenal\"@en,\"Liverpool\"@en,\"Everton\"@en,\"Leicester City\"@en"
                    +",\"Juventus\"@en,\"Roma\"@en,\"Napoli\"@en,\"Milan\"@en,\"Inter Milan\"@en,\"Fiorentina\"@en"
                    +",\"Real Madrid\"@en,\"Barcelona\"@en,\"Atlético de Madrid\"@en"
                    +",\"Bayern Munich\"@en,\"Borussia Dortmund\"@en,\"RB Leipzig\"@en"
                    +",\"Monaco\"@en,\"Paris Saint-Germain\"@en,\"OGC Nice\"@en,\"Lyon\"@en"
                    +",\"Ajax\"@en,\"Feyenoord\"@en,\"PSV\"@en)) ."
                  +"} UNION {"
                    +"?altName rdfs:label \""+name+"\"@en ;"
                              +"dbo:wikiPageRedirects ?SoccerPlayer ."
                    +"?SoccerPlayer a dbo:SoccerPlayer ."
                    +"?SoccerPlayer dbp:name ?name ."
                    +"?SoccerPlayer dbp:position ?position ."
                    +"?SoccerPlayer dbo:birthDate ?birthday ."
                    +"?SoccerPlayer dbo:height ?height ."
                    +"?SoccerPlayer dbo:number ?number ."
                    +"?SoccerPlayer dbp:clubs ?clubs ."
                    +"?clubs dbp:clubname ?clubname ."
                    +"FILTER(?clubname IN(\"Chelsea\"@en,\"Tottenham Hotspur\"@en,\"Manchester City\"@en"
                    +",\"Manchester United\"@en,\"Arsenal\"@en,\"Liverpool\"@en,\"Everton\"@en,\"Leicester City\"@en"
                    +",\"Juventus\"@en,\"Roma\"@en,\"Napoli\"@en,\"Milan\"@en,\"Inter Milan\"@en,\"Fiorentina\"@en"
                    +",\"Real Madrid\"@en,\"Barcelona\"@en,\"Atlético de Madrid\"@en"
                    +",\"Bayern Munich\"@en,\"Borussia Dortmund\"@en,\"RB Leipzig\"@en"
                    +",\"Monaco\"@en,\"Paris Saint-Germain\"@en,\"OGC Nice\"@en,\"Lyon\"@en"
                    +",\"Ajax\"@en,\"Feyenoord\"@en,\"PSV\"@en)) ."
                  +"}}"


    var query = "query=" + encodeURI(command);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader("Accept", "application/sparql-results+json");

    xhr.onreadystatechange = function(){
                if(xhr.readyState == 4){
                    var sta = xhr.status;
                    if(sta == 200 || sta == 304){           
                        var jsonObj = eval('(' + xhr.responseText + ')');
                        if(jsonObj.results.bindings[0]!=null){
                            callback(jsonObj,image); 
                        }else{
                          var nameSplit = name.split(" ");
                          var namePieces = nameSplit.length;

                          if(namePieces>1){
                             name = nameSplit[0];
                             for(var i=0;i<namePieces-2;i++){
                                  name = name.concat(" ");
                                  name = name.concat(nameSplit[i+1]);
                             }
                             callback(getInfo(name,callback),image);
                          }
                        }
                    }else{
                        callback(false);
                    }
                    window.setTimeout(function(){
                        xhr.onreadystatechange= new Function();
                        xhr = null;
                    },0);
                }
            }
             
    xhr.send(query);
  }

  