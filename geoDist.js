// Exercise to accept an array of cities and return the two closest cities

var http = require('http');
var key = require('./keys.js');

// Array of cities
var cityArray = [
  "Los Angeles,CA", "San Francisco,CA", "Boston,MA", "New York,NY",
  "Washington,DC", "Seattle,WA", "Austin,TX", "Chicago,IL", "San Diego,CA",
  "Denver,CO", "London,England", "Toronto,Canada", "Sydney,Australia", 
  "Melbourne,Australia", "Paris,France", "Singapore,Singapore"
];


function geoLoc(arrOfCities) {
  // Object to hold shortest distance
    // Objext to hold input cities and latitude and longitude data
  var cityArr = [];
  
  // Function to generate query string to send MapQuest API
  function bulkQry(arr) {
    resultString = "";
    arr.forEach(function(city) {
      let temp = city.replace(/\s+/g, '_');
      resultString = resultString.concat('&location='+temp);
    })
    return resultString;
  }

  var query = bulkQry(arrOfCities);
  // console.log("Query result: ", query);

  /*
   *Function to get distance in miles between two geographic
   *points(Adapted from StackOverflow)
   */
  function getDist(lat1, lon1, lat2, lon2) {
    var R = 3959; // miles
    function toRad(degrees) {
      return degrees * (Math.PI/180);
    }
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
  }

  // Function to generate an array of city location objects
  function geoCity(obj) {
    var resultArr = [];
    var resArr = obj['results'];
    resArr.forEach(function(city){
      var tempObj = {}
      tempObj[city["providedLocation"]["location"]] =
        [
          city["locations"][0]["displayLatLng"]["lat"],
          city["locations"][0]["displayLatLng"]["lng"]
        ]
      resultArr.push(tempObj);
    })
    console.log("city object: ", resultArr);
    return resultArr;
  }

  // Function to find shortest distance between two cities
  function shortestDist (citiesArray) {
    var shortObj = {
      "cityA" : "",
      "cityB" : "",
      "distance" : 0
    }
    // Get distance between each city pair and compare against current shortest
    for(var i = 0; i < citiesArray.length; i++) {
      for(var j = i + 1; j < citiesArray.length; j++) {
        var cityA = citiesArray[i];
        var keyA = Object.keys(cityA)[0];
        var cityB = citiesArray[j];
        var keyB = Object.keys(cityB)[0];
        var distance = getDist(cityA[keyA][0], cityA[keyA][1], cityB[keyB][0], cityB[keyB][1]); 
        if((distance < shortObj["distance"]) || (shortObj["distance"] === 0)) {
          shortObj["cityA"] = keyA;
          shortObj["cityB"] = keyB;
          shortObj["distance"] = Math.round(distance);
        }
      }
    }
    return shortObj;
  }

  /*
   *Function to make bulk API call to MapQuest API (Up to 100 locations per
   *call) then return the two closest cities
   */

  function getGeoBulk(qry){
    var apiAdd = `http://www.mapquestapi.com/geocoding/v1/batch?key=${key['mapQuest']}`;
      
    // Basic get request pulled from Node.js documentation  
    http.get(apiAdd += qry, function(res) {
      var statusCode = res.statusCode;
      var contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.log(error.message);
        // consume response data to free up memory
        res.resume();
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', function(chunk) {rawData += chunk});
      res.on('end', function(){
        try {
          var locData = JSON.parse(rawData);
          var cityArr = geoCity(locData);
          var shortObj = shortestDist(cityArr);
          return console.log(
            "City A: " + shortObj["cityA"] + 
            "\nCity B: " + shortObj["cityB"] + 
            "\nDistance: " +  shortObj["distance"] + " miles"
          );

        } catch (e) {
          console.log(e.message);
        }
      });
    }).on('error', function(e) {
      console.log(`Got error: ${e.message}`);
    });
  }
  
  getGeoBulk(query);
}

geoLoc(cityArray);
