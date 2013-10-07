var config = require(process.cwd() + '/lib/config');
var pg = require('pg');
var Driver = function () {};

Driver.config = config.database;

Driver.connect = function (cb) {
  pg.connect(this.config, function (err, client) {
    cb.call(this, err, client);
  });
}

Driver.query = function (q, v, cb) {
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

module.exports = Driver;
