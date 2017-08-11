var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

//create a sendjson function
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.reviewsReadOne = function(req, res){
    //err trap 1: check that the locationid exists in request parameters
    //verify that reviewid exists as a parameter
    if (req.params && req.params.locationid && req.params.reviewid) {
        Loc
            .findById(req.params.locationid)
            //add mongoose select method to model query,
            //stating that we want to get name of location and its reviews
            .select('name reviews')
            .exec(
                function(err, location){
                    var response, review;
                    //err trap 2: if mongoose doesn't return a location,
                    //send 404 message and exit function scope using return statement
                    if (!location) {
                        sendJSONresponse(res, 404, {
                            "message" : "locationid not found"
                        });
                        return; 
                        //err trap 3: if mongoose returned an error, 
                        //send it as a 404 response and exit controller using return statement                   
                    } 
                    //check that returned location has reviews
                    if (location.reviews && location.reviews.length > 0){
                        //use mongoose subdocument id method as a helper for searching matching ID
                        review = location.reviews.id(req.params.reviewid);
                        //if review isn't found, return appriopriate response
                        if (!review){
                            sendJSONresponse(res, 404, {
                                "message" : "reviewid not found"
                            });
                        } else {
                            //if review is found, build response object returning review and location name and ID
                            response = {
                                location: {
                                    name : location.name,
                                    id : req.params.locationid
                                },
                                review : review
                            };
                            sendJSONresponse(res, 200, response);
                        }
                    } else {
                        //if no reviews are found, return appropriate error message
                        sendJSONresponse(res, 404, {
                            "message" : "No reviews found"
                        });
                    }
                }
            );
        } else {
            sendJSONresponse(res, 404, {
                "message" : "Not found, locationid and reviewid are both required"
            });
    }  
};


//post route for review
module.exports.reviewsCreate = function(req, res){
    var locationid = req.params.locationid;
    if (locationid) {
        Loc
            .findById(locationid)
            .select('reviews')
            .exec(
                function(err, location){
                    if (err) {
                    sendJSONresponse(res, 400, err);
                    } else {
                        //successful find operations will call new function to add review,
                        //passing request, response, and location objects
                        doAddReview(req, res, location);
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message" : "Not found, locationid required"
        });
    }
};

var doAddReview= function(req, res, location) {
    //when presented with a parent document...
    if (!location) {
        sendJSONresponse (res, 404, {
            "message" : "locationid not found"
        });
    } else {
        //push new data into subdocument array...
        location.reviews.push({
        author: req.body.author,
        rating: req.body.rating,
        reviewText: req.body.reviewText
    });
    //before saving it
    location.save(function(err, location){
        var thisReview;
        if (err) {
           sendJSONresponse(res, 400, err);
        } else {
            //on successful save operation, call function to update average rating
            updateAverageRating(location._id);
           //retrieve last review added to array and return it as a JSON confirmation response
           thisReview = location.reviews[location.reviews.length - 1];
           sendJSONresponse(res, 201, thisReview)
           }
        });
    }
}; 

var updateAverageRating = function(locationid) {
    //find correct document given supplied ID
    Loc
        .findById(locationid)
        .select('ratimg reviews')
        .exec(
            function(err, location) {
                if(!err) {
                    doSetAverageRating(location);
                }
            }
        );
}

var doSetAverageRating = function (location) {
    var i, reviewCount, ratingAverage, ratingTotal;
    if (location.reviews && location.reviews.length > 0) {
        reviewCount = location.reviews.length;
        ratingTotal = 0;
        for (i = 0; i < reviewCount; i++) {
            //loop through review subdocuments adding up ratings
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }
        //calculate average rating value
        ratingAverage = parseInt (ratingTotal / reviewCount, 10);
        //update rating value of parent document
        location.rating = ratingAverage;
        //save parent document
        location.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Average rating updated to', ratingAverage);
            }
        });
    }
};

//put route for review
module.exports.reviewsUpdateOne = function(req, res) {
    if (!req.params.locationid || !req.params.reviewid) {
        sendJSONresponse (res, 404, {
            "message" : "Not found, locationid and reviewid are both required"
        });
        return;
    }
    Loc
    //find parent document
        .findById(req.params.locationid)
        .select('reviews')
        .exec(
            function(err, location) {
                var thisReview;
                if (!location) {
                    sendJSONresponse(res, 404, {
                        "message" : "locationid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res,400, err);
                    return;
                }
                if (location.reviews && location.reviews.length > 0) {
                    //find subdocument
                    thisReview = location.reviews.id(req.params.reviewid);
                    if (!thisReview) {
                        sendJSONresponse(res, 404, {
                            "message" : "reviewid not found"
                        });
                    } else {
                        //make changes to subdocument from supplied form data
                        thisReview.author = req.body.author;
                        thisReview.rating = req.body.rating;
                        thisReview.reviewText = req.body.reviewText;
                        //save parent document
                        location.save(function(err, location) {
                            if(err) {
                                sendJSONresponse(res, 404, err);
                            } else {
                                //return a JSON response, sending subdocument on basis of sucessful save
                                updateAverageRating(location._id);
                                sendJSONresponse(res, 200, thisReview);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message" : "No review to update"
                    });
                }
            }
        );
};

//delete route for review
module.exports.reviewsDeleteOne = function(req, res) {
    if (!req.params.locationid || !req.params.reviewid) {
        sendJSONresponse(res, 404, {
            "message" : "Not found, locationid and reviewid are both required"
        });
        return;
    }
    //find relevant parent document
    Loc
        .findById(req.params.locationid)
        .select('reviews')
        .exec(
            function(err, location) {
                if(!location) {
                    sendJSONresponse(res, 404, {
                        "message" :"locationid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (location.reviews && location.reviews.length > 0) {
                    if (!location.reviews.id(req.params.reviewid)) {
                        sendJSONresponse(res, 404, {
                            "message" : "reviewid not found"
                        });
                    } else {
                        //find and delete relevant subdocument in one step
                        location.reviews.id(req.params.reviewid).remove();
                        //save parent document
                        location.save(function(err) {
                            //return appropriate success or failure response
                            if (err) {
                                sendJSONresponse(res, 404, err);
                            } else {
                                updateAverageRating(location._id);
                                sendJSONresponse(res, 204, null);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message" : "No review to delete"
                    });
                }
            }
        );
};
