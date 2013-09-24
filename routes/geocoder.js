var GeocodeServer = require(process.cwd() + '/lib/geocode_server');
var Point = require(process.cwd() + '/models/point');
var Address = require(process.cwd() + '/models/address')

module.exports.geocodeAddress = function (req, res) {
  var address = new Address({ street: req.address })
  GeocodeServer.geocodeAddress(address, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}

module.exports.reverseGeocode = function (req, res) {
  var point = new Point({ x: req.query.lng, y: req.query.lat })
  GeocodeServer.reverseGeocode(point, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}

module.exports.findAddressCandidates = function (req, res) {
  var address = new Address({ street: req.query.address })
  GeocodeServer.findAddressCandidates(address, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}
