var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});
connection.connect();

var howManySoFar;

//
function storeIntoDb(tweetList,queryID,func){//insert new Tweets into the Tweet table
	//console.log(tweetList);
	howManySoFar=0;
	for (var ix=0; ix< tweetList.length; ix++){
		//console.log(ix);
		var tweet= tweetList[ix];
		//console.log(tweet);
		var query = connection.query('INSERT INTO Tweets SET ?', tweet,
			function(err, result) {
				if(err) throw err;
				++howManySoFar;
			});

	}
	getTweets(queryID,function(tweetList){
		if (func!=null){func(tweetList);}
	});
}

function addQuery(newQuery,func){//insert a new query to Query table
	connection.query("INSERT INTO Query (query) VALUES (?);",newQuery,
	function(err,results){
		if(err) throw err;
	});
	getQueryID(newQuery,function(queryID){
		if (func!=null){func(queryID);}
	});
	
}

function getQueryID(currentQuery,func){//return the id of a query, for searching
	// tweets in the Tweets table
	connection.query('select * from Query where query = ?;',currentQuery,
	function(err,results){
		//console.log(results);
		if (results==undefined || results == ''){
			queryId = null;
		}else{
			queryId = results[0].id;
			//console.log(queryId);
		}
		if(func !=null){
		func(queryId);
		}
	});
}

function getTweets(query_id,func){//get tweets from Tweets table by query id
	//var tweetList = [];
	var tweetList = [];
	connection.query('select * from Tweets where query_id = ? order by time DESC;',query_id,
	function(err, rows, field){
		//console.log(rows);
		if(err) throw err;
        for (var i in rows) {
            tweetList.push(rows[i]);
        }
        if(func !=null){
		func(tweetList);
		}
	});
}

function getQuery(queryID,func){//return the date of last search and the last id
	//of the last tweet in the previous search
	//console.log(queryID);
	var query = connection.query('select * from Query where id = ? ;',queryID,
	function(err,results,field){
		//console.log(results);
		if(err) throw err;
		//console.log(results);
    //console.log(results[0]);
		var lastQueryDate = results[0].last_search_date;
		var lastQueryId = results[0].last_tweet_id;
		var dbQuery = results[0].query;
    //console.log(lastQueryDate);
		if(func !=null){
		func(dbQuery,lastQueryDate, lastQueryId);
		}
	});
}

function updateQuery(queryID, date, tweet_id){
	//update date of last search and the last id of the last tweet
	//in the previous search
  //console.log(date);
	que1 = 'update Query SET last_search_date = ? where id = ? ;';
	que1Param = [date, queryID];
	connection.query(que1,que1Param,function(err,results){
		if(err) throw err;
	});
	que2 = 'update Query SET last_tweet_id = ? where id = ?;';
	que2Param = [tweet_id,queryID];
	connection.query(que2,que2Param,function(err,results){
		if(err) throw err;
	});
}
// api
exports.getTweets = getTweets;
exports.storeIntoDb = storeIntoDb;
exports.updateQuery = updateQuery;
exports.addQuery = addQuery;
exports.getQueryID = getQueryID;
exports.getQuery = getQuery;
