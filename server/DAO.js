/**
* This is a file of database operations
* Author Shuo Zhou, University of Sheffield
*
**/
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'stusql.dcs.shef.ac.uk',
    user: 'team100',
    password: 'c14ea6ac',
    database: 'team100'
});
connection.connect();

var howManySoFar;
/**
* This is a function for insert an array of tweets into the database
* This is a public function, thrrow error when error occers
**/
//
function storeIntoDb(tweetList,func){//insert new Tweets into the Tweet table
	howManySoFar=0;
	for (var ix=0; ix< tweetList.length; ix++){
		var tweet= tweetList[ix];
		var query = connection.query('INSERT IGNORE INTO tweetTable SET ?', tweet,
			function(err, result) {
				if(err) throw err;
				++howManySoFar;
			});
	}
}
/**
* This is a function for checking whether a query contained in the database,
* This is a public function
* a boolean value (true or false) will be returned by the function
**/
function isQueried(twitQuery,func){//check whether the query is existed in the database
  var queried = false;
  var query = connection.query("SELECT * FROM queryTable WHERE query=?;",twitQuery,
    function(err,results){
      if(err) throw err;
      if (results.length!=0){
        queried = true;
      }
      if (func!=null) {
        func(queried);
      }
    });
}

/**
* This is a function for insert a new query into the database
* This is a public function
* Thrrow errors when error occurs
**/

function addQuery(twitQuery){// insert the query to the database
  var query = connection.query('INSERT IGNORE INTO queryTable (query) VALUES (?)',twitQuery,function(err,result){
    if(err) throw err;
  });
}

/**
* This is a function for retrieve data from database
* This is a public function
* Return an array of tweets (tweet id > lastID) 
* Thrrow errors when error occurs
**/

function getTweets(dbQuery,lastID,func){//get tweets from database
	var tweetList = [];
	connection.query(dbQuery,	function(err, rows, field){
		if(err) throw err;
        for (var i in rows) {
          if (rows[i].tweet_id==lastID) {
            break;
          }
          tweetList.push(rows[i]);
        }
        if(func !=null){
		        func(tweetList);
          }
	});
}

// api
exports.getTweets = getTweets;
exports.storeIntoDb = storeIntoDb;
exports.isQueried = isQueried;
exports.addQuery = addQuery;
