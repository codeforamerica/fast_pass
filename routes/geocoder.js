var GeocodeClient = require(process.cwd() + '/lib/geocode_client');
var Point = require(process.cwd() + '/models/point');
var Address = require(process.cwd() + '/models/address')

module.exports.geocodeAddress = function (req, res) {
  var address = new Address({ street: req.address })
  GeocodeClient.geocodeAddress(address, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}

module.exports.reverseGeocode = function (req, res) {
  var point = new Point({ x: req.query.lng, y: req.query.lat })
  GeocodeClient.reverseGeocode(point, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}

module.exports.findAddressCandidates = function (req, res) {
  var address = new Address({ street: req.query.address })
  GeocodeClient.findAddressCandidates(address, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}
