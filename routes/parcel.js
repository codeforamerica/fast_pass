var Parcel = require( process.cwd() + '/models/parcel' );
var ParcelClient = require( process.cwd() + '/lib/parcel_client' );
var dummyResponse = require( process.cwd() + '/data/parcels' );

module.exports.search = function (req, res) {
  var position = req.query.position;
  ParcelClient.search(position, function (data) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(data);
    res.end();
  });
}

module.exports.index = function (req, res) {
  Parcel.all(function (rows) {
    res.writeHead(200, {'Content-Type': 'application/geojson'});
    res.write(JSON.stringify(dummyResponse));
    res.end();
  });
}

module.exports.find = function (req, res) {
  Parcel.find(req.params.id, function (row) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(row));
    res.end();
  })
}
