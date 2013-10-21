var ParcelClient   = require( process.cwd() + '/lib/parcel_client' );
var parcelsGeoJSON = require( process.cwd() + '/data/parcels' );

//
// Defer to the Vegas Parcel Finding API for now
//
module.exports.search = function (req, res) {
  res.format({
    json: function () {
      var position = req.query.position;
      ParcelClient.search(position, function (data) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write( data );
        res.end();
      });
    } 
  });
}

//
// Mock out Parcel GeoJSON data for now
//
module.exports.index = function (req, res) {
  res.format({
    geojson: function () {
      res.writeHead(200, { 'Content-Type': 'application/geojson' });
      res.write( JSON.stringify(parcelsGeoJSON) );
      res.end();
    } 
  });
}
