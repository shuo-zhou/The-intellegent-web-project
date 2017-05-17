var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'stusql.dcs.shef.ac.uk',
    user: 'team100',
    password: 'c14ea6ac',
    database: 'team100'
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
		var query = connection.query('INSERT INTO tweetTable SET ?', tweet,
			function(err, result) {
				if(err) throw err;
				++howManySoFar;
			});
	}
}

function getTweets(dbQuery,func){//get tweets from database
	//var tweetList = [];
	var tweetList = [];
	connection.query('?',query_id,
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

// api
exports.getTweets = getTweets;
exports.storeIntoDb = storeIntoDb;
