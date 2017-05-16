var Twit = require('twit');
var client = new Twit({
  consumer_key: 'q94xTrkN1r9tkFBKS1kDy8XdC',
  consumer_secret: 'xJ3ibeL8rtlelBTA25IWIikamo4gVn0mjOfEWjdMNqH2eSh6zS',
  access_token: '757576042404048897-yx69iG6akPFWOz7Dp7AUk9v9Dov56RK',
  access_token_secret: 'TyU5buOXn0beRaHgS8HJAK8fUQgwJMezfzTIXXqGKx7TS'
});

function queryTwitter(player_club,author,func){
	var DB = require('./DB.js');
	var dbQuery = '';
	if (author == ''){//check whether author included in query
		dbQuery = player_club;
	}else{
		dbQuery = player_club+' from:'+author;
	}

	DB.getQueryID(dbQuery,function(queryID){//check whether query in the DB or not
		if (queryID == null){
			//insert a new query to the database if the query not in the QUery table
			DB.addQuery(dbQuery);
			DB.getQueryID(dbQuery,function(queryID){
				searchTweets(queryID);//search new tweets and insert into database
				DB.getTweets(queryID,function(tweetList){
					var tweetJson = {
                  		data:tweetList
                	};
					//console.log(tweetList);
					//search new tweets and insert into database
					var tweetListString = JSON.stringify(tweetJson);
					if(func !=null){func(tweetListString);}
				});
			});
		}else{
			searchTweets(queryID);
			DB.getTweets(queryID,function(tweetList){
				var tweetJson = {
                  		data:tweetList
                };
				var tweetListString = JSON.stringify(tweetJson);
				if(func !=null){func(tweetListString);}
			});
		}
	});
}

function searchTweets(queryID){//search new tweets and insert into database
	var DB = require('./DB.js');
	DB.getQuery(queryID,function(dbQuery, lastQueryDate, lastQueryID){
		var query = '';
		if (lastQueryDate != null){
			query = dbQuery+' since:'+lastQueryDate;
		}else{
			query = dbQuery;
		}
		//console.log(query);
		client.get('search/tweets', {q: query, count: 20 },function(err, data, response) {
        	newTweets = []
          //console.log(data.statuses);
        	for (var indx in data.statuses) {
        		//break the loop if the last tweet in the database was found in this query
        		//avoid storing same tweets
				        var tweet= data.statuses[indx];
                //console.log(tweet.id_str);
                //console.log(lastQueryID);
                if (tweet.id_str == lastQueryID){break;}
				if (indx == 0) {// update the Query table
					var date = new Date(tweet.created_at);
					var day = date.getDate().toString();
					var month = date.getMonth()+1;
					var year = date.getFullYear().toString();
					var new_lastQueryDate = year+'-'+month.toString()+'-'+day;
					var new_lastQueryID = tweet.id_str;
					DB.updateQuery(queryID, new_lastQueryDate, new_lastQueryID);
				}
				newTweets.push({
					tweet_id: tweet.id_str,
					author: tweet.user.screen_name,
					author_id: tweet.user.id_str,
					author_profile_image: tweet.user.profile_image_url_https,
					time: tweet.created_at,
					contents: tweet.text,
					query_id: queryID});
			}
      //console.log(newTweets);
			//sotre data to database
			DB.storeIntoDb(newTweets);
		});

	});
}

exports.queryTwitter = queryTwitter;
