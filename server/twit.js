/*
* Author Shuo Zhou, University of Sheffield 
* This file contains two functions: 
* queryTwitter: generate queries, retrieve data from database and twitter 
* api, return an array of tweets
* searchTweets: search new tweets, return an array of tweets and store 
* into database. SearchTweets contains a recurisve function implemented 
* for retrieving at least 300 tweets if possible. The recursive process 
* may runnning a longer time
*
* queryTwitter is a public function
* searchTweets is a private function
* 
*/


var Twit = require('twit');
var client = new Twit({
  consumer_key: 'q94xTrkN1r9tkFBKS1kDy8XdC',
  consumer_secret: 'xJ3ibeL8rtlelBTA25IWIikamo4gVn0mjOfEWjdMNqH2eSh6zS',
  access_token: '757576042404048897-yx69iG6akPFWOz7Dp7AUk9v9Dov56RK',
  access_token_secret: 'TyU5buOXn0beRaHgS8HJAK8fUQgwJMezfzTIXXqGKx7TS'
});

function queryTwitter(player,playerTeam,team,teamAuthor,author,DBOnly,func){

  var DAO = require('./DAO.js')
  //########################################################
  //generate query for search data
  //twitQuery for search data by twitter api
  //dbQuery for search data from database
  var twitQuery='';
	var dbQuery = '';
  var temp_p = '';
  var temp_t = '';
  var temp_a = '';
  if (player!=''){//check whether player included in query
    var p = player.split(" ");
    temp_p = p[0].toLowerCase();
    twitQuery = twitQuery+temp_p;
    dbQuery = dbQuery+" where (lower(contents) LIKE \'%"+temp_p+"%\'";
    for (i=1;i<p.length;i++){
      if (p[i]!=""){
        temp_p=p[i].toLowerCase();
        if (temp_p!='or') {
          twitQuery=twitQuery+' OR '+temp_p;
          dbQuery=dbQuery+" OR lower(contents) LIKE \'%"+temp_p+"%\'";
        }//end if
      }//end if
    }//end for
    dbQuery = dbQuery+")";
    if(team!=''){//check whether team included in query
      var t = team.split(" ");
      temp_t = t[0].toLowerCase();
      if(playerTeam=='AND'){
        twitQuery=twitQuery+' '+temp_t;
        dbQuery=dbQuery+" AND (lower(contents) LIKE \'%"+temp_t+"%\'";
      }else{
        twitQuery=twitQuery+' OR '+temp_t;
        dbQuery=dbQuery+" OR (lower(contents) LIKE \'%"+temp_t+"%\'";
      }//end else
      for (i=1;i<t.length;i++){
        if (t[i]!="") {
          temp_t = t[i].toLowerCase();
          if (t[i].toLowerCase()!='or') {
            twitQuery=twitQuery+' OR '+temp_t;
            dbQuery=dbQuery+" OR lower(contents) LIKE \'%"+temp_t+"%\'";
          }//end if
        }//end if
      }//end for
      dbQuery = dbQuery + ")";
    }//end if(team)
  }else{
    if(team!=''){//check whether team included in query
      var t = team.split(" ");
      temp_t = t[0].toLowerCase();
      twitQuery=twitQuery+temp_t;
      dbQuery = dbQuery+" where (lower(contents) LIKE \'%"+temp_t+"%\'";
      for (i=1;i<t.length;i++){
        if(t[i]!=""){
          temp_t = t[i].toLowerCase();
          if (temp_t!='or') {
            twitQuery=twitQuery+' OR '+temp_t;
            dbQuery=dbQuery+" OR lower(contents) LIKE \'%"+temp_t+"%\'";
          }//end if
        }//end if
      }//end for
      dbQuery = dbQuery+")";
    }//end if
  }//end else
    if(author!=''){//check whether author included in query
      var a = author.split(" ");
      temp_a = a[0].toLowerCase()
      if(twitQuery==''){
        twitQuery=twitQuery+'(from:'+temp_a;
        dbQuery=dbQuery+" where (lower(author) = '"+temp_a+"'";
      }else if(teamAuthor=='AND'){
        twitQuery=twitQuery+' (from:'+temp_a;
        dbQuery=dbQuery+" AND (lower(author) = '"+temp_a+"'";
      }else{
        twitQuery=twitQuery+' OR (from:'+temp_a;
        dbQuery=dbQuery+" OR (lower(author) = '"+temp_a+"'";
      }
        for (i=1;i<a.length;i++){
          if (a[i]!="") {
            temp_a = a[i].toLowerCase()
            if (temp_a!='or') {
              twitQuery=twitQuery+' OR from:'+temp_a;
              dbQuery=dbQuery+" OR lower(author) = '"+temp_a+"'";
            }//end if
          }//end if
        }//end for
        dbQuery = dbQuery+")";
        twitQuery = twitQuery+")";
      }//end if(author)
      dbQuery = "select * from tweetTable" + dbQuery;
      dbQuery = dbQuery+" ORDER BY time DESC;";
      // end of generate queries
      //###################################################
      var serverNum=0;
      var twitNum=0;
      if (DBOnly==null) {
        DAO.isQueried(twitQuery,function(queried){
          if (queried==true) {//search from databse if query exists
            var lastID = null;
            DAO.getTweets(dbQuery,lastID,function(tweetList){
              //search from twitter api
              serverNum = tweetList.length;
              searchTweets(tweetList,twitQuery,function(results){
                twitNum = results.length-serverNum;
                if(func !=null){func(results,serverNum,twitNum);}
              });
            });
          }else{//search from twitter api directly if query not exists
            var tweetList=[];
            searchTweets(tweetList,twitQuery,function(results){
              twitNum = results.length - serverNum;
              if(func !=null){func(results,serverNum,twitNum);}
            });
            DAO.addQuery(twitQuery);
          }
        });
      }else {
        var lastID = null;
        DAO.getTweets(dbQuery,lastID,function(tweetList){
          serverNum = tweetList.length;
          if(func !=null){func(tweetList,serverNum,twitNum);}
        });//only return the results from database if tick the box
        //of only search from local database
      }
}//end function


function searchTweets(tweetList,twitQuery,func){//search new tweets and insert into database
  var DAO = require('./DAO.js');
  var isEmpty = true;
  if (tweetList.length!=0){
    isEmpty = false;
  }
  var searchQuery = twitQuery;
  var newIDList = [];
  var lastTweetID='';
  if (isEmpty==false){
    lastTweetID=tweetList[0].tweet_id;
    //lastTweetID=tweetList[0].tweet_id;
    searchQuery = twitQuery+' since_id:'+lastTweetID;
  }

	client.get('search/tweets', {q: searchQuery, count: 100},function(err, data, response) {
      var newTweets = [];
      for (var indx in data.statuses) {
		    var tweet= data.statuses[indx];
        //if (idList.indexOf(tweet.id_str)==-1){//avoid storing same tweets
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
      }//end for


      DAO.storeIntoDb(newTweets);
      var results;
      if (isEmpty==true){
        results = newTweets;
      }else{
        results = newTweets.concat(tweetList);
      }

      if (results.length<=300){
        //recurrent fuction for retrieving at least 300 twitters
      var searchEarlyTweets = function(tweetList,twitQuery){
        var maxID = "";
        var searchQuery = twitQuery;
        var earlyTweetID='';
        var num = tweetList.length

        if (tweetList.length!=0){
          earlyTweetID=tweetList[tweetList.length-1].tweet_id;
          //lastTweetID=tweetList[0].tweet_id;
          searchQuery = twitQuery+' max_id:'+earlyTweetID;
        }

      	client.get('search/tweets', {q: searchQuery, count: 100},function(err, data, response) {
            var newTweets = [];
            for (var indx in data.statuses) {
      		    var tweet= data.statuses[indx];
              //if (idList.indexOf(tweet.id_str)==-1){//avoid storing same tweets
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
            }//end for
            DAO.storeIntoDb(newTweets);
            tweetList = tweetList.concat(newTweets);
            if ((tweetList.length>=300) || (newTweets.length<100)) {
              if (func!=null){
                func(tweetList);
              }
            }else{
              searchEarlyTweets(tweetList,twitQuery);
            }
          });
        }//end searchEarlyTweets
        searchEarlyTweets(results,twitQuery);
      }else{
        if (func!=null){
          func(results);
        }
      }//end if
	});//end searchTweets
}//end function


exports.queryTwitter = queryTwitter;
