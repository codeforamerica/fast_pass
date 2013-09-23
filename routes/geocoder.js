module.exports.geocode = function (req, res) {
  var data = {}
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(data));
  res.end();
}

module.exports.reverseGeocode = function (req, res) {
  var data = {}
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(data));
  res.end();
}
