// Exercise to accept an array of cities and return the two closest cities

// Array of cities
const key = require('./keys.js');

const cityArray = [
  "Los Angeles,CA", "San Francisco,CA", "Boston,MA", "New York,NY",
  "Washington,DC", "Seattle,WA", "Austin,TX", "Chicago,IL", "San Diego,CA",
  "London,England", "Toronto,Canada", "Sydney,Australia", "Melbourne,Australia",
  "Paris,France"
];

function geoLoc(arrOfCities) {
  function bulkQry(arr) {
    resultString = "";
    arr.forEach(function(city) {
      let temp = city.replace(/\s+/g, '_');
      resultString = resultString.concat('&location='+temp);
    })
    return resultString;
  }
  const query = bulkQry(arrOfCities);
  console.log("Query result: ", query);
  return query;
}

geoLoc(cityArray);
