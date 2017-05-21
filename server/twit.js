var Twit = require('twit');
var client = new Twit({
  consumer_key: 'q94xTrkN1r9tkFBKS1kDy8XdC',
  consumer_secret: 'xJ3ibeL8rtlelBTA25IWIikamo4gVn0mjOfEWjdMNqH2eSh6zS',
  access_token: '757576042404048897-yx69iG6akPFWOz7Dp7AUk9v9Dov56RK',
  access_token_secret: 'TyU5buOXn0beRaHgS8HJAK8fUQgwJMezfzTIXXqGKx7TS'
});

function queryTwitter(player,playerTeam,team,teamAuthor,author,func){
	//var DB = require('./DB.js');
  var DAO = require('./DAO.js')
  var twitQuery='';
	var dbQuery = '';
  if (player!=''){//check whether player included in query
    var p = player.split(" ");
    twitQuery = twitQuery+p[0];
    dbQuery = dbQuery+" where contents LIKE \'%"+p[0]+"%\'";
    for (i=1;i<p.length;i++){
      if (p[i]!=" "){
        if (p[i].toLowerCase()!='or') {
          twitQuery=twitQuery+' OR '+p[i];
          dbQuery=dbQuery+" OR contents LIKE \'%"+p[i]+"%\'";
        }//end if
      }//end if
    }//end for
    if(team!=''){//check whether team included in query
      var t = team.split(" ");
      if(playerTeam=='AND'){
        twitQuery=twitQuery+' '+t[0];
        dbQuery=dbQuery+" AND contents LIKE \'%"+t[0]+"%\'";
      }else{
        twitQuery=twitQuery+' OR '+t[0];
        dbQuery=dbQuery+" OR contetns LIKE \'%"+t[0]+"%\'";
      }//end else
      for (i=1;i<t.length;i++){
        if (t[i]!=" ") {
          if (t[i].toLowerCase()!='or') {
            twitQuery=twitQuery+' OR '+t[i];
            dbQuery=dbQuery+" OR contents LIKE \'%"+t[i]+"%\'";
          }//end if
        }//end if
      }//end for
    }//end if(team)
  }else{
    if(team!=''){//check whether team included in query
      var t = team.split(" ");
      twitQuery=twitQuery+' '+t[0];
      dbQuery = dbQuery+" where contents LIKE \'%"+t[0]+"%\'";
      for (i=1;i<t.length;i++){
        if(t[i]!=" "){
          if (t[i].toLowerCase()!='or') {
            twitQuery=twitQuery+' OR '+t[i];
            dbQuery=dbQuery+" OR contents LIKE \'%"+t[i]+"%\'";
          }//end if
        }//end if
      }//end for
    }//end if
  }//end else
    if(author!=''){//check whether author included in query
      var a = author.split(" ");
      if(twitQuery==''){
        twitQuery=twitQuery+'from:'+a[0];
        dbQuery=dbQuery+" where author LIKE \'%"+a[0]+"%\'";
      }else if(teamAuthor=='AND'){
        twitQuery=twitQuery+' from:'+a[0];
        dbQuery=dbQuery+" AND author LIKE '%"+a[0]+"%'";
      }else{
        twitQuery=twitQuery+' OR from:'+a[0];
        dbQuery=dbQuery+" OR author LIKE '%"+a[0]+"%'";
      }
        for (i=1;i<a.length;i++){
          if (a[i].toLowerCase()!='or') {
            twitQuery=twitQuery+' OR '+a[i];
            dbQuery=dbQuery+" OR author LIKE '%"+a[i]+"%'";
          }//end if
        }//end for
      }//end if(author)
      dbQuery = "select * from tweetTable" + dbQuery;
      dbQuery = dbQuery+" ORDER BY time DESC;";



  DAO.getTweets(dbQuery,function(tweetList,idList){

    searchTweets(tweetList,idList,twitQuery,function(results){
      var tweetJson = {
                    data:results
              };
      var resultString = JSON.stringify(tweetJson);
      if(func !=null){func(resultString);}
    })
  });
}//end function

function searchTweets(tweetList,idList,twitQuery,func){//search new tweets and insert into database
	//var DB = require('./DB.js');
  var DAO = require('./DAO.js');
  var isEmpty = true;
  if (tweetList.length!=0){
    isEmpty = false;
  }
  //console.log(tweetListString);
  //var lastTweetTime =null;
  //var earlyTweetTime=null;
  var lastTweetID='';
  var earlyTweetID='';
  if (isEmpty==false){
    lastTweetTime=new Date(tweetList[0].dateTime_str);
    //lastTweetID=tweetList[0].tweet_id;
    twitQuery=twitQuery+' since:'+lastTweetTime.getFullYear().toString()+'-'+
    (lastTweetTime.getMonth()+1).toString()+'-'+lastTweetTime.getDate().toString();
  }
  console.log(twitQuery);

	client.get('search/tweets', {q: twitQuery, count: 10},function(err, data, response) {
  //console.log(data.statuses);
      var newTweets = [];
      for (var indx in data.statuses) {


		    var tweet= data.statuses[indx];
        if (idList.indexOf(tweet.id_str)!=-1){continue;}//avoid storing same tweets
        var date = new Date(tweet.created_at);
        newTweets.push({
          tweet_id: tweet.id_str,
				  author: tweet.user.screen_name,
				  author_id: tweet.user.id_str,
    			author_profile_image: tweet.user.profile_image_url_https,
    			dateTime_str: tweet.created_at,
          date: date,
          time: date,
    			contents: tweet.text,
    		});
      //console.log(newTweets);
			//sotre data to database

      }//end for

      DAO.storeIntoDb(newTweets);
      var results;
      if (isEmpty==true){
        results = newTweets;
      }else{
        results = newTweets.concat(tweetList);
      }
      if(func !=null){
        func(results);

      }


	});//end searchTweets


}//end function

exports.queryTwitter = queryTwitter;
