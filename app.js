var http = require('http');
var fs = require('fs');
var months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

var server = http.createServer(function(req, res) {
  var url = req.url;

  //feed static index.html if at the home url or pass the url
  //to another function if there is anything attached to it
  if (url === '/') {
    fs.readFile('./static/index.html', function(err, html) {
      if (err) throw err;
      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      res.end();
    })
  } else {
    res.end(JSON.stringify(sendTime(url)));
  }
})


function sendTime(url) {
  var param = url.substring(1, url.length);

  //checks if the url parameter starts with a number
  //and is the same length as unix time (10 characters)
  if (Number.isInteger(parseInt(param.charAt(0))) &&
    param.length <= 10) {

    var date = new Date(param * 1000);
    var natural = months[date.getMonth()]
      + " " + date.getDate()
      + ", " + (date.getYear() + 1900);
    return {"unix": param, "natural": natural};

    //checks to see if the first part of the passed url is a valid month
  } else if (checkNaturalDate(param)[0]) {

      var results = checkNaturalDate(param);
      var returnString = results[1].toString() + " " +
        results[2].toString() + ", " + results[3].toString();

      var date = new Date(returnString);

      return {"unix": (date.getTime() / 1000), "natural": returnString};

  //returns null if we don't get a valid unix time or natural date
  } else {

      return {"unix": null, "natural": null};

  }
};


function checkNaturalDate(param) {

    //collects the positions that the elemets are diveded at
    var monthDivision = param.indexOf("%20");
    var dayDivision = param.indexOf(",", monthDivision);
    var yearDivision = param.indexOf("%20", dayDivision);

    //makes sure all required elements are present
    if (monthDivision === -1 ||
      dayDivision === -1 ||
      yearDivision === -1) {return [0];}

    var monthToTest = param.substring(0, monthDivision);
    var dayNumber = param.substring(monthDivision + 3, dayDivision);
    var yearNumber = param.substring(yearDivision + 3, param.length);

    //capitalizes only the first letter of the month
    monthToTest = monthToTest.charAt(0).toUpperCase() +
      monthToTest.substring(1, monthToTest.length).toLowerCase();
    if (months.indexOf(monthToTest) === -1) return [0]

    //makes sure the year is at the end and is a 4 digit integer
    //and is past 1970 for positive unix time
    if (!Number.isInteger(parseInt(yearNumber)) ||
      yearNumber.length !== 4 || yearNumber < 1970) {
      return [0];
    }

    //makes sure the day number passsed is a positive number
    if (!Number.isInteger(parseInt(dayNumber) || dayNumber < 1)) {
      return [0];
    }

    //checks the upper day limit for months with 31 days
    if (['January', 'March', 'May', 'July', 'August',
      'October', 'December'].indexOf(monthToTest) > -1 &&
      dayNumber > 31) {
        return [0];
    }

    //checks the upper day limit for months with 30 days
    if (['April', 'June', 'September', 'November'].indexOf(monthToTest) > -1
    && dayNumber > 30) {
      return [0];
    }

    //checks for February on and off leap years
    var leapYear = ((yearNumber) % 4 == 0);

    if (monthToTest == "February" && leapYear && dayNumber > 29) {
      return [0];
    }
    if (monthToTest == "February" && !leapYear && dayNumber > 28) {
      return [0];
    }

    //if all checks are passed, an array is passed back with the
    //first element being a truth check for the function that called it
    return [1, monthToTest, dayNumber, yearNumber];
}

var portNumber = process.env.port || 3000
server.listen(portNumber);
console.log("Listening on port " + portNumber.toString());
