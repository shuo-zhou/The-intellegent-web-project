/*
 * search on Twit "users" API to get the regesitered name list of verified users
 * Created by Yongshuo, 19/05/2017
 */

var Twit = require('twit');
var nameCompare = require('./nameCompare.js');
var playerName = nameCompare.playerName;

var client = new Twit({
  consumer_key: 'q94xTrkN1r9tkFBKS1kDy8XdC',
  consumer_secret: 'xJ3ibeL8rtlelBTA25IWIikamo4gVn0mjOfEWjdMNqH2eSh6zS',
  access_token: '757576042404048897-yx69iG6akPFWOz7Dp7AUk9v9Dov56RK',
  access_token_secret: 'TyU5buOXn0beRaHgS8HJAK8fUQgwJMezfzTIXXqGKx7TS'
});

/*
 * callback verified user information get from twit by user input
 */
function getUser(player,author,func){
  var info=[];
  var list=[];

  var a = author.split(" ");
  var p = player.split(" ");
  
  // filter the same input
  list.push(a[0]);
  for(var i=0;i<a.length;i++){
    for(var j=0;j<list.length;j++){
      if(a[i]==list[j]){
        break;
      }
      if(j==list.length-1){
        list.push(a[i]);
      }
    }
  }
  for(var i=0;i<p.length;i++){
    for(var j=0;j<list.length;j++){
      if(p[i]==list[j]){
        break;
      }
      if(j==list.length-1){
        list.push(p[i]);
      }
    }
  }

  var i=0;
  // store userInfo get from tweet into list
  var loopArray = function(searchArray){       
    if(searchArray[i]!=""){

      searchAuthor(searchArray[i],function(verified,name,image,bg){

        curName = searchArray[i].toLowerCase();      
        i++;      
        if(playerName[curName]!=null){
          info.push({
              image: image,
              authorName: playerName[curName],
              verified: true,
              bg:bg 
            });
        }else if(verified==true){      
            info.push({
              image: image,
              authorName: name,
              verified: verified,
              bg:bg 
            });
          }

        if(i<searchArray.length){
          loopArray(searchArray);
        }else{
          if(func!=null){
            func(info);
          }
        }
      });
    }else{
      i++;
      if(i < searchArray.length){
        loopArray(searchArray);   
      }else{
        if(func!=null){
          func(info);
        }
      }
    }
  }
  loopArray(list);
      
}

/*
 * search author info from tweet
 */
function searchAuthor(author,func){
      client.get('users/show',{screen_name:author},
                function(err, data, response){ 
                  //console.log(data);
                  if(data.errors==null){
                    if(data.verified==true){                    
                        if(data.profile_background_image_url_https=="https://abs.twimg.com/images/themes/theme1/bg.png"
                          ||data.profile_background_image_url_https=="https://abs.twimg.com/images/themes/theme14/bg.gif"){
                          func(data.verified,data.name,data.profile_image_url_https,false);//data.profile_image_url_https);                
                        }else{
                          func(data.verified,data.name,data.profile_background_image_url_https,true);
                        }
                    }else{
                      if(func!=null){
                        func(0);
                      }
                    }
                  }else{
                    if(func!=null){
                        func(1);
                    }
                  }
          });
}

exports.getUser = getUser;





