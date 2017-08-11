var request = require('request');
var apiOptions = {
  //set default URL for local development
  server: 'http://localhost:3000'
};
//if application is running in production mode, set different base URL;
//change to be live address of application
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = 'https://blooming-bastion-42962.herokuapp.com'
}

/* The basic construct for using a request module
request(options, callback)
*/

//add additional responseBody parameter to function declaration
var renderHomepage = function(req, res, responseBody) {
  //define a variable to hold message
  var message;
  //if response isn't array, set message,
  //and set responseBody to be empty array
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    //if responseBody is array with no length, set message
    if (!responseBody.length) {
      message = "No places found nearby";
    }
  }
  res.render('locations-list', {
    title: 'loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: 'Looking for wifi and a seat?\n Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? let Loc8r help you find the place you\'re looking for.',
    //remove hard-coded array of locations and pass responseBody through instead
    locations: responseBody,
    //add message to variables to send to view
    message: message
  });
};

// GET locations-list page
 module.exports.homelist = function(req, res) {
  var requestOptions, path;
  //set path for API request
  //(server is already set at top of file)
  path = '/api/locations';
  //set request options, including URL, method, empty JSON body,
  //and hard-coded query string parameters
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {},
    qs : {
      lng : -0.7992559,
      lat : 51.455041,
      maxDistance : 200000000
    }
  };
  //make a request, sending through request options
  request(
    //supplying callback to render homepage
    requestOptions, 
    function(err, response, body) {
      // assign returned body data to a new variable
      var i, data;
      data = body;
      //only runs loop to format distances if API returned a 200 status and some data
      if (response.statusCode === 200 && data.length) {
      //loop through array, formatting distance value of location
        for (i = 0; i < data.length; i++) {
          data[i].distance = _formatDistance(data[i].distance);
          //send modified data to be rendered instead of original body
          // original body rendering =  renderHomepage (req, res, body);
        }
      }
      renderHomepage(req, res, data);
    }    
  );
  var _formatDistance = function(distance){
    var numDistance, unit;
    //if supplied distance is over 1 km, round to to one decimal place and add km unit
    if (distance > 1) {
      numDistance = parseFloat(distance).toFixed(1);
      unit = ' km';
    } else {
      //otherwise convert to meters and round to nearest meter before adding m unit
      numDistance = parseInt(distance * 1000,10);
      unit = ' m';
    }
    return numDistance + unit;
  }
};

//create named function and move all contents of locationinfo controller into it
//add new parameter for data in function definition
var renderDetailPage = function(req, res, locDetail) {
  res.render('location-info', {
    //reference specific items of data as needed in function
    title: locDetail.name,
    pageHeader: {title: locDetail.name},
    sidebar: {
      context: 'is on loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
      callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to  help other people just like you.'
    },
    //pass full locDetail data object to view, containing all details
    location: locDetail
  });
};

var _showError = function(req, res, status) {
  var title, content;
  if (status === 404) {
    title = "404. page nor found";
    content = "Oh dear. Looka like we can't find this page. Sorry.";
  } else {
    title = status + ", something's gone wrong";
    content = "Something somewhere, has gone a little bit wrong."
  }
  res.status(status);
  res.render('generic-text', {
    title: title,
    content: content
  });
};

/* this was the getLocationInfo function before it was modified to allow for
reusable functions
module.exports.locationInfo = function(req, res){
  //call new function from controller, remembering to pass its req and res parameters
  var requestOptions, path;
  //get locationid parameter from URL and append it to API path
  path = '/api/locations/' + req.params.locationid;
  requestOptions = {
    //set all request options needed to call API
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      //create copy of returned data in new variable 
      var data = body;
      if (response.statusCode === 200) {
      data.coords = {
        lng : body.coords[0],
        lat : body.coords[1]
      };
      renderDetailPage(req, res, data);
      } else{
        _showError(req, res, response.statusCode);
      }      
    }
  );
};
*/

var getLocationInfo = function(req, res, callback){
  //call new function from controller, remembering to pass its req and res parameters
  var requestOptions, path;
  //get locationid parameter from URL and append it to API path
  path = '/api/locations/' + req.params.locationid;
  requestOptions = {
    //set all request options needed to call API
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      //create copy of returned data in new variable 
      var data = body;
      if (response.statusCode === 200) {
      data.coords = {
        lng : body.coords[0],
        lat : body.coords[1]
      };
      //following successful API response, invoke callback instead of named function
      callback(req, res, data);
      } else{
        _showError(req, res, response.statusCode);
      }      
    }
  );
};

//call get locationInfo function, passing a callback function that will call,
//renderDetailPage upon completion
module.exports.locationInfo = function(req, res){
  getLocationInfo(req, res, function(req, res, responseData){
    renderDetailPage(req, res, responseData)
  });
}
  
//create named function and move contents of addReview container into it
var renderReviewForm =  function(req, res, locDetail){
  res.render('location-review', {
    title: 'Review ' + locDetail.name + ' on Loc8r',
    pageHeader: { title: 'Review ' + locDetail.name },
    location: locDetail
  });
};

//call function from the addReview controller, passing through same parameters,
//and pass renderReviewForm in callback
//GET addReview page
module.exports.addReview =function(req, res){
  renderReviewForm(req, res, function(req, res, responseData){
    renderReviewForm(req, res, responseData);
  });
};



module.exports.doAddReview = function(req, res){

}