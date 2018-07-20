/*
* Author Shuo Zhou, University of Sheffield 
* Two functions are contained: 
* queryTwitter: retrieve data from database and twitter api, 
* return an array of tweets, and the number of tweets retrieved 
* from database and twitter api respectively
*
* searchTweets: search new tweets, return an array of tweets and 
* store into database. 
* queryTwitter is a public function
* searchTweets is a private function
* 
*
*/

var Twit = require('twit');
var client = new Twit({
  consumer_key: 'q94xTrkN1r9tkFBKS1kDy8XdC',
  consumer_secret: 'xJ3ibeL8rtlelBTA25IWIikamo4gVn0mjOfEWjdMNqH2eSh6zS',
  access_token: '757576042404048897-yx69iG6akPFWOz7Dp7AUk9v9Dov56RK',
  access_token_secret: 'TyU5buOXn0beRaHgS8HJAK8fUQgwJMezfzTIXXqGKx7TS'
});

function queryTwitter(dbQuery,twitQuery,lastID,firstID,mobileQueried,func){
  var DAO = require('./DAO.js');
  var serverNum = 0;
  if (mobileQueried==true) {
    //check whether this query is queried before by the mobile
    DAO.getTweets(dbQuery,lastID,function(tweetList){
      //search from database
      serverNum = tweetList.length;
      if(serverNum!=0){
        lastID = tweetList[0].tweet_id;
      }
      searchTweets(tweetList,twitQuery,lastID,function(results,twitNum){
        //search from twitter api
        if(func !=null){func(results,serverNum,twitNum);}
      });
    });
  }else{
    //this query is not queried by the mobile phone
    DAO.isQueried(twitQuery,function(serverQuired){
      //check whether the query is queried by the server
      if (serverQuired==true) {
        //this query is queried before by the server
        //search from database
        DAO.getTweets(dbQuery,lastID,function(tweetList){
          serverNum = tweetList.length;
          if (serverNum!=0) {
            lastID = tweetList[0].tweet_id;
          }
          //search by twitter api
          searchTweets(tweetList,twitQuery,lastID,function(results,twitNum){
            if(func !=null){func(results,serverNum,twitNum);}
          });
        });
      }else{
        //this query is not queried by the server before
        //search through twitter api directly
        lastID =null;
        var tweetList = [];
        searchTweets(tweetList,twitQuery,lastID,function(results,twitNum){
          if(func !=null){func(results,serverNum,twitNum);}
          //add the query to queryTable
          DAO.addQuery(twitQuery);
        });
      }
    });
  }//end else

}//end function

function searchTweets(tweetList,twitQuery,lastID,func){//search new tweets and insert into database
  var DAO = require('./DAO.js');
  var searchQuery = twitQuery;
  var twitNum = 0;
  if (lastID!=null){
    //avoid searching repeat information by twitter api
    searchQuery = twitQuery+' since_id:'+lastID;
  }

  //retrieving data by twitter api
	client.get('search/tweets', {q: searchQuery, count: 100},function(err, data, response) {
      var newTweets = [];
      var twitNum = 0;
      for (var indx in data.statuses) {
		    var tweet= data.statuses[indx];
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
      twitNum = newTweets.length;
      DAO.storeIntoDb(newTweets);
      var results;
      if (lastID==null){//only results from twitter api if no data stored in database
        results = newTweets;
      }else{
        // merge two arrays and return
        results = newTweets.concat(tweetList);
      }
      if(func !=null){
        func(results,twitNum);
      }
	});//end searchTweets
}
exports.queryTwitter = queryTwitter;
