module.exports.homelist = function(req, res) {
  res.render('locations-list', { title: 'Express' });
};

module.exports.locationInfo = function(req, res){
  res.render('location-info', {title: 'Location Info'});
};

module.exports.addReview = function(req, res){
  res.render('location-review', {title: 'Add Review'});
};