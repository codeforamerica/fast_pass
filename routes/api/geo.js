var GeoClient = require(process.cwd() + '/lib/geo_client');
var mockNeighborhoods = require(process.cwd() + '/data/neighborhoods');
var mockCity = require(process.cwd() + '/data/city');

module.exports.geocode = function (req, res) {

  var onSuccess = function (data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write( JSON.stringify(data) );
    res.end();
  }

  var onError = function (err) {
    var data = { "error": err };
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.write( JSON.stringify(data) );
    res.end();
  }

  var address = req.query.address;

  GeoClient.geocodeAddress(address, onSuccess, onError)
}

module.exports.reverse_geocode = function (req, res) {

  var onSuccess = function (data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write( JSON.stringify(data) );
    res.end();
  }

  var onError = function (err) {
    var data = { "error": err };
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.write( JSON.stringify(data) );
    res.end();
  }

  var position = req.query.position;

  GeoClient.geocodeAddress(position, onSuccess, onError);
}

module.exports.neighborhoods = function (req, res) {
  var data = mockNeighborhoods;
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write( JSON.stringify(data) );
  res.end();
}

module.exports.city = function (req, res) {
  var data = mockCity;
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write( JSON.stringify(data) );
  res.end();
}
