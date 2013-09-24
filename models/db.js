var pg = require('pg')
var DB = function () {}

var host = 'localhost'
var name = 'fast_track'

DB.config = {
  host: host,
  database: name
}

DB.connect = function (cb) {
  pg.connect(DB.config, function (err, client) {
    cb.call(this, err, client);
  });
}

DB.query = function (q, v, cb) {
  this.connect(function (err, client) {
    if (err) {
      throw err;
    } else {
      client.query(q, v, function (err, result) {
        if (err) {
          console.log(err);
          cb([]);
        } else {
          cb(result.rows);
        }
        client.end();
      });
    }
  });
}

module.exports = DB
