var GeoClient = require(process.cwd() + '/lib/geo_client');
var dummyNeighborhoods = require(process.cwd() + '/data/neighborhoods');
var dummyCity = require(process.cwd() + '/data/city');

module.exports.geocode = function (req, res) {
  var address = req.query.address;
  GeoClient.geocodeAddress(address, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}

module.exports.reverse_geocode = function (req, res) {
  var position = req.query.position;
  GeoClient.geocodeAddress(position, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}

module.exports.neighborhoods = function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(dummyNeighborhoods));
  res.end();
}

module.exports.city = function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(dummyCity));
  res.end();
}
