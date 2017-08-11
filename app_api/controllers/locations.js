var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

//create a sendjson function
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

//define fixed value of the radius of the earth
var theEarth = (function(){
        var earthRadius = 6371; //in km
   
    //create function to convert distance radiance to distance
    var getDistanceFromRads = function(rads){
        return parseFloat(rads * earthRadius);
    };

    //create function to convert distance to radians
    var getRadiansFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    };

    //expose both functions
    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadiansFromDistance
    };   
})();

module.exports.locationsListByDistance = function(req, res){
    //get coordinates from query string and convert from strings to numbers
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance);
    //create JSON point, declare abject and define it as type 'Point'
    //set longitude and latitude coordinates in an array, longitude first
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };

    //create options object,
     //including setting max distance to 20 km
    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(maxDistance),
        num: 10
    };

    if ((!lng && !lng === 0) || (!lat && !lat === 0)) {
        console.log('locationListByDistance missing params');
        sendJSONresponse(res, 404, {            
            "message" : "lng, and lat query parameters are required"
        });
        return;
    }

   Loc.geoNear(point, geoOptions, function(err, results, stats){
       var locations = [];
       console.log('Geo Results', results);
       console.log('Geo stats', stats);
       if (err) {
           sendJSONresponse(res, 404, err);
       } else {      
         results.forEach(function(doc) {
            locations.push({
                //get distance and convert from radians to kilometers,
                //using helper functions previously created
                distance: theEarth.getDistanceFromRads(doc.dis),
                //push rest of required data into return object
                name: doc.obj.name, 
                address: doc.obj.address,
                rating: doc.obj.rating,
                facilities: doc.obj.facilities,
                _id: doc.obj._id
            });
    })
    sendJSONresponse(res, 200, locations);
       }
   });
};

/*barebones create method
Loc.create(dataToSave, callback)
*/
//define POST route for locations-each
module.exports.locationsCreate = function(req, res){
    console.log(req.body);
    //apply create method to model
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        //create array of facilities by splitting a comma-seperated list
        facilities: req.body.facilities.split(","),
        //parse coordinates from strings to numbers
        coords: [parseFloat (req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days:req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1,
        },{
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2,
        }]
        //supply callback function, containing appropriate responses for success and failure
    }, function(err, location) {
        if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
        } else {
            console.log(location);
            sendJSONresponse(res, 201, location)
        }
    })
};



//Define GET route for locations-each
module.exports.locationsReadOne = function(req, res){
    //err trap 1: check that the locationid exists in request parameters
    if (req.params && req.params.locationid) {
    Loc
        .findById(req.params.locationid)
        .exec(function(err, location){
            //err trap 2: if mongoose doesn't return a location,
            //send 404 message and exit function scope using return statement
            if (!location) {
                sendJSONresponse(res, 404, {
                    "message": "locationid not found"
                });
                return;
                //err trap 3: if mongoose returned an error, 
                //send it as a 404 response and exit controller using return statement
                } else if (err) {
                    sendJSONresponse(res, 404, err);
                    return;
                }
                sendJSONresponse(res, 200, location);          
            }); 
        //if request parameters didn't include locationid,
        //send appriopriate 404 response   
        } else{
            sendJSONresponse(res, 404, {
                "message" : "No locationid in request"
            });
        }
    };

//put route for location-each
module.exports.locationsUpdateOne = function(req, res){
    if (!req.params.locationid) {
        sendJSONresponse(res, 404, {
            "message" : "Not found, loocationid is required"
        });
        return
    }
    Loc
    //find location document by supplied id
        .findById(req.params.locationid)
        //the preceeding dash says 'retrieve everything except the reviews and rating',
        //without the dash, it would say 'retrieve only the reviews and the rating'
        .select('-reviews -rating')
        .exec(
            function(err, location) {
                if(!location) {
                    sendJSONresponse(res, 404, {
                        "message" : "locationid not found"
                    })
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return
                }
                //update paths with values from submitted form
                location.name = req.body.name;
                location.address = req.body.address;
                location.facilities = req.body.facilities.split(',');
                location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
                location.openingTimes = [{
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1,
                }, {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2,
                }];
                //save instance
                location.save(function(err, location) {
                    //send appriopriate response, depending on outcome of save operation
                    if (err) {
                        sendJSONresponse (res, 404, err);
                    } else {
                        sendJSONresponse(res, 200, location);
                    }
                });
            }
        );
};

module.exports.locationsDeleteOne = function(req, res) {
    var locationid = req.params.locationid;
    if (locationid) {
        Loc
            //call findbyidand remove method, passing in location id
            .findByIdAndRemove (locationid)
            //execute method
            .exec(
                function(err, location) {
                    if (err) {
                        //respond with success or failure
                        sendJSONresponse(res, 404, err);
                        return;
                    }
                    sendJSONresponse(res, 204, null)
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message" : "No locationid"
        });
    }
};