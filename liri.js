//// initialize ////
// load inquirer - needed to request user inputs
var inquirer = require("inquirer");
// load twitter package. referencing 'private' keys
var keys = require("./keys");
var Twitter = require("twitter");
var client = new Twitter({
  consumer_key: keys.twitterKeys.consumer_key,
  consumer_secret: keys.twitterKeys.consumer_secret,
  access_token_key: keys.twitterKeys.access_token_key,
  access_token_secret: keys.twitterKeys.access_token_secret
});
// load spotify package
var spotify = require('spotify');
// load request package. need for url imbd api
var request = require('request');
// Load the fs package to read and write
var fs = require("fs");
////////////////////////////

//// promt user via terminal ////
var userPromts = [
  { // limiting user actions to a choice
    type: "list",
    message: "Select an action",
    choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
    name: "selection"
  },
  { // action to perform based on selection
    when: function (response) { // return true or false
      if (response.selection === "spotify-this-song") {
        return true;
      }
    }, // if user picks spotfiy user now has to provide song
    type: 'input',
    name: 'song',
    message: 'enter song name'
  },
  { // action to perform based on selection
    when: function (response) { // return true or false
      if (response.selection === "movie-this") {
        return true;
      }
    }, // if user picks movie user now has to provide movie
    type: 'input',
    name: 'movie',
    message: 'enter movie name'
  },
  // return api data //
  {
    when: function (response) { // actions to be taken with user inputs
      //console.log(response.selection);

      // read text file //
      var refSelection;
      var refName;
      if (response.selection === "do-what-it-says") {
        var textFile = fs.readFileSync("random.txt", "utf8", function(err, data) { //reading file
          if (err) {
            return console.log(err);
          }
        });
        data = textFile.split(","); // comma seperated file
        refSelection = data[0]; // action in text file
        refName = data[1]; // name of song/movie
      }
      // console.log("refSelection " + refSelection);
      // console.log("refName " + refName);

      if (response.selection === "my-tweets") {
        client.get(
          '/statuses/user_timeline.json',
          { screen_name: 'JuanCAnalytics', count: 10}, // currently shows my last 10 tweets but can update the user to return anyones tweets
          function(error, tweets) {
            //this function is called a "callback"
            console.log("//////////////////////////////");
            //console.log(tweets);
            fs.appendFileSync("log.txt", "\n//////// " + response.selection + " ////////");
            for (var i = 0; i < 10; i++) {
              fs.appendFileSync("log.txt", "\n---  " + tweets[i].text);
              console.log(" --- " + tweets[i].text);
            }
            //console.log("1 " + tweets[0].text);
            //console.log("2 " + tweets[1].text);
          }
        );
      }
      else if (response.selection === "spotify-this-song" || refSelection === "spotify-this-song") { // also checking if the text file command is do-what-it-says. can use same code 
        // setting default song selction //
        var songSelected;
        if (refSelection === undefined) {
          if (response.song === "" || response.song === undefined) {
            songSelected = 'The Sign';
          } 
          else {
            songSelected = response.song;
          }
        }
        else {
          songSelected = refName;
        }

        // returning spotify information related to song selected
        spotify.search({ type: 'track', query: '"' + songSelected + '"' }, function(err, data) {
          if ( err ) {
            //console.log('Error occurred: ' + err);
            return;
          }
          console.log("//////////////////////////////");
          //console.log(data.tracks);

          // output to text file
          fs.appendFileSync("log.txt", "\n//////// " + response.selection + " ////////");
          fs.appendFileSync("log.txt", "\nartists: " + data.tracks.items[0].artists[0].name);
          fs.appendFileSync("log.txt", "\nsong: " + data.tracks.items[0].name);
          fs.appendFileSync("log.txt", "\npreview url: " + data.tracks.items[0].preview_url);
          fs.appendFileSync("log.txt", "\nalbum: " + data.tracks.items[0].album.name);

          // print to bash
          console.log("artists: " + data.tracks.items[0].artists[0].name);
          console.log("song: " + data.tracks.items[0].name);
          console.log("preview url: " + data.tracks.items[0].preview_url);
          console.log("album: " + data.tracks.items[0].album.name);
        });
      }
      else if (response.selection === "movie-this") {
        var movieSelected = response.movie;
        // setting default movie
        if (response.movie === "") {
          movieSelected = 'Mr. Nobody';
        }
        
        var apiUrl = 'http://www.omdbapi.com/?t=' + movieSelected;
        //console.log(apiUrl);

        request(apiUrl, function (error, responsed, body) {
          //console.log('error:', error); // Print the error if one occurred 
          //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
          //console.log(response);
          var info = JSON.parse(body);

          // output to text file
          fs.appendFileSync("log.txt", "\n//////// " + response.selection + " ////////");
          fs.appendFileSync("log.txt", "\nTitle: " + info.Title);
          fs.appendFileSync("log.txt", "\nYear: " + info.Year);
          fs.appendFileSync("log.txt", "\nimdbRating: " + info.imdbRating);
          fs.appendFileSync("log.txt", "\nCountry: " + info.Country);
          fs.appendFileSync("log.txt", "\nLanguage: " + info.Language);
          fs.appendFileSync("log.txt", "\nPlot: " + info.Plot);
          fs.appendFileSync("log.txt", "\nActors: " + info.Actors);
          fs.appendFileSync("log.txt", "\nRotten Tomatoes Rating: " + info.Ratings[1].Value);
          //fs.appendFileSync("log.txt", "\nrotten url: " + "https://www.rottentomatoes.com/m/her/"); // replacing her based on user input with spaces/special chars will return 404 paga
          fs.appendFileSync("log.txt", "\nrotten url: " + "https://www.rottentomatoes.com/search/?search=" + info.Title); // search link more flexable

          //console.log(info);
          console.log("Title: " + info.Title);
          console.log("Year: " + info.Year);
          console.log("imdbRating: " + info.imdbRating);
          console.log("Country: " + info.Country);
          console.log("Language: " + info.Language);
          console.log("Plot: " + info.Plot);
          console.log("Actors: " + info.Actors);
          console.log("Rotten Tomatoes Rating: " + info.Ratings[1].Value);
          //console.log("rotten url: " + "https://www.rottentomatoes.com/m/her/"); // replacing her based on user input with spaces/special chars will return 404 paga
          console.log("rotten url: " + "https://www.rottentomatoes.com/search/?search=" + info.Title); // search link more flexable
        });
      }
    } 
  }

];

inquirer.prompt(userPromts, function(response) {
  //console.log("hello");
  //console.log(response);
});





