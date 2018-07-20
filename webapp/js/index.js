/**
 * functions used for showing info on web page
 * Created by Yongshuo on 20/03/2017.
 */

/**
 * generate frequency chart
 */ 
function makeChart(dates,dataPointArray) {
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: dates,
        datasets: [{
            label: 'number of tweets',
            data: dataPointArray,
            backgroundColor: [
                'rgba(255, 186, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,186, 64,1)',
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]

    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }

});
}

/*
 * show info on GUI
 */ 
function showTweets(jsonList){
  var serverNum = jsonList.serverNum;
  var twitNum = jsonList.twitNum;
  var length = jsonList.data.length;

  if(length>1){
    if(jsonList.data[length-2].tweet_id==jsonList.data[length-1].tweet_id){
      jsonList.data.splice(length-1,1);
      twitNum--;
    }
  }

  $('#searchNumbers').append(serverNum+" from database and "
                            +twitNum+" from twitter");
  $('#underlinePlayer').append('<div class="col-md-12 underline_form"></div>');

  $('#frequency').append('<h5>Query frequency of the last week: <h5>');
  //used for storing the number of tweets in the last 7 days
  var dataPointArray = [];
  var dates = [];
  //generate an array of the dates of the last 7 days
  for (var i = 0; i < 7; i++) {
    numDays = 6-i;
    dates[i] = moment().subtract(numDays,'days').format("YYYY-MM-DD");
    dataPointArray[i] = 0;
  }

  var num=6;
  //convert the date to YYYY-MM-DD format
  for(var i in jsonList.data){
      var list = jsonList.data[i];
      var date = new Date(list.dateTime_str);
      var day = date.getDate();
      var dayStr = day.toString();
      if (day<10) {
        dayStr = '0'+dayStr;
      };
      var month = date.getMonth()+1;
      var monthStr = month.toString();
      if (month<10) {
        monthStr = '0'+ monthStr;
      };
      var year = date.getFullYear();
      var date_string = year.toString()+'-'+monthStr+'-'+dayStr;


      $('#tweets').append('<div class="media">'
          +'<a href="#" class="pull-left" style="padding-right:15px;">'
          +'<img src="'+list.author_profile_image+'" class="media-object" alt="" style="border-radius:10px;"/>'
          +'</a>'
          +'<div class="media-body">'
          +'<h4 class="media-heading"><a href="https://twitter.com/'+list.author+'">'+list.author+'</a></h4>'
          +'<p class="date_string">'+date_string+'</p>'
          +'<a style="color:black" href="https://twitter.com/'+list.author+'/status/'+list.tweet_id+'">'+list.contents+'</a>'
          +'</div></div>');

    switch(date_string) {
        case dates[6]:
            dataPointArray[6]+=1;
            break;
        case dates[5]:
            dataPointArray[5]+=1;
            break;
        case dates[4]:
            dataPointArray[4]+=1;
            break;
        case dates[3]:
            dataPointArray[3]+=1;
            break;
        case dates[2]:
            dataPointArray[2]+=1;
            break;
        case dates[1]:
            dataPointArray[1]+=1;
            break;
        case dates[0]:
            dataPointArray[0]+=1;
            break;

    }//end switch
  }//end for
  // show the frequency on the webpage
  for (var i = 0; i < 7; i++) {
    $('#frequency').append('<h6 class="queryTimes">'+dates[6-i]+': '+dataPointArray[6-i]+'<h6>');
  }                    
  if(dataPointArray.length>0){
      makeChart(dates,dataPointArray);
  }else{
      alert("No result found.")
  }
}


/*
 * show author info on screen
 */
function showAuthorInfo(jsonObj,image) {
        if(jsonObj==null){
            console.log("can not find out player");
        }else if(jsonObj==false){
            console.log("can not find out player");
        }else if(jsonObj.results.bindings[0]!=null){
            
            var playerName = jsonObj.results.bindings[0].name.value;
            var clubname = jsonObj.results.bindings[0].clubname.value;
            if(jsonObj.results.bindings[0].birthday!=null){
              var birthday = jsonObj.results.bindings[0].birthday.value;
            }
            if(jsonObj.results.bindings[0].height!=null){
              var height = jsonObj.results.bindings[0].height.value;
              height = parseFloat(height)*100;
              height = height.toString().concat("cm");
            }
            if(jsonObj.results.bindings[0].number!=null){
              var number = jsonObj.results.bindings[0].number.value;
            }
            var positionAddress = jsonObj.results.bindings[0].position.value;
            var position;
            if(positionAddress.includes("Forward")){
              position = "Forward";
            }else if(positionAddress.includes("Midfielder")){
              position = "Midfielder";
            }else if(positionAddress.includes("Defender")){
              position = "Defender";
            }else if(positionAddress.includes("Goalkeeper")){
              position = "Goalkeeper"
            }

            $('#playerInfo').append('<img src="'+image+'" class="playerImage" alt="" style="border-radius:10px;"/>');

            $('#playerInfo').append('<div class="playerName">'+playerName+'</div>'
                      +'<div class="playerProperty">Height: '+height+'</div>'
                      +'<div class="playerProperty">Birthday: '+birthday+'</div>'
                      +'<div class="playerProperty">Club: '+clubname+'</div>'
                      +'<div class="playerProperty">Number: '+number+'</div>'
                      +'<div class="playerProperty">Playing Position: '+position+'</div>');

         }else{
            console.log("can not find out player");
         }
    
}