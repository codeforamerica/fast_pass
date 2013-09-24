var Parcel = require( process.cwd() + '/models/parcel' );

module.exports.index = function (req, res) {
  Parcel.all(function (rows) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(rows));
    res.end();
  });
}

module.exports.search = function (req, res) {
  Parcel.search(req.query, function (rows) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(rows));
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
