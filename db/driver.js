var config = require(process.cwd() + '/config/config');
var pg = require('pg');

var Driver = function () {};

Driver.config = config.database;

Driver.connect = function (cb) {
  pg.connect(Driver.config, function (err, client) {
    cb.call(Driver, err, client);
  });
}

Driver.query = function (q, v, cb) {
  Driver.connect(function (err, client) {
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
