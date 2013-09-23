var GeoCoder = require(process.cwd() + '/lib/geocoder');
var Point = require(process.cwd() + '/models/point');
var Address = require(process.cwd() + '/models/address')

module.exports.geocode = function (req, res) {
  var address = new Address({ street: req.address })
  GeoCoder.geocode(address, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}

module.exports.reverseGeocode = function (req, res) {
  var point = new Point({ x: req.query.lng, y: req.query.lat })
  GeoCoder.reverseGeocode(point, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}
