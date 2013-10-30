var GeoClient = require(process.cwd() + '/lib/geo_client');

module.exports.geocodeAddress = function (req, res) {
  var address = req.query.address;
  GeoClient.geocodeAddress(address, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}

module.exports.geocodePosition = function (req, res) {
  var position = req.query.position;
  GeoClient.geocodeAddress(position, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(data));
    res.end();
  });
}
