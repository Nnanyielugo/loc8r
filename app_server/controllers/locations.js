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
var renderHomepage = function(req, res) {
    res.render('locations-list', {
    title: 'loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'Find places to work with wifi near you!'
    },
    sidebar: 'Looking for wifi and a seat?\n Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? let Loc8r help you find the place you\'re looking for.'
    });
};

// GET locations-list page
 module.exports.homelist = function(req, res) { 
      renderHomepage(req, res);       
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
    title = "404. page not found";
    content = "Oh dear. Looks like we can't find this page. Sorry.";
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
    //send new error variable to view, passing it query parameters when it exists
    error: req.query.err,
    //use the originalUrl property to enable form submission on same page with angular
    url: req.originalUrl 
  });
};

//call function from the addReview controller, passing through same parameters,
//and pass renderReviewForm in callback
//GET addReview page
module.exports.addReview = function(req, res){
  getLocationInfo(req, res, function(req, res, responseData){
    renderReviewForm(req, res, responseData);
  });
};

//POST reviews
module.exports.doAddReview = function(req, res){
  var requestOptions, path, locationid, postdata;
  locationid = req.params.locationid;
  //get location ID from URL to construct API url
  path = '/api/locations/' + locationid + '/reviews';
  //create data object to send to API using submitted form data
  postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };
  requestOptions = {
    //set request options, including path, setting POST method,
    //and passing submitted form data into json parameter
    url: apiOptions.server + path,
    method: "POST",
    json: postdata
  };
  if (!postdata.author || !postdata.rating || !postdata.reviewText){
    res.redirect('/location/' + locationid + 'reviews/new?err=val');
  } else{
    request(
      requestOptions,
      function(err, response, body){
    if (response.statusCode === 201){
      res.redirect('/location/' + locationid);
      //add in check to see if status is 400, if body has a name,
      //and if that name id ValidationError
    } else if (response.statusCode === 400 && body.name && body.name == "ValidationError"){
      //if true, redirect to review form, passing an error flag in query string
      res.redirect('/location/' + locationid + '/reviews/new?err=val');
    } else {
      console.log(body);
      _showError(req, res, response.statusCode);
    }
  }
  );
 }
};