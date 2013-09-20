var pg = require('pg')
var Database = function () {}

var host = 'localhost'
var name = 'fast_track'

Database.config = {
  host: host,
  database: name
}

Database.connect = function (cb) {
  pg.connect(Database.config, function (err, client) {
    cb.call(this, err, client);
  });
}

Database.query = function (q, v, cb) {
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

module.exports = Database
