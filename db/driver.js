var config = require( process.cwd() + '/config/config' );
var pg = require('pg');

//
// DB Driver function
//
var Driver = function () {};

//
// Creates a connection to the DB
//
Driver.connect = function (onConnect, onError) {

  pg.connect(config.database, function (err, client, done) {
    if (err) {
      onError(err);
    } else {
      onConnect(err, client, done);
    }
  });

  return this;
}

//
// Performs a query on the DB
//
Driver.perform = function (query, values, onSuccess, onError) {

  onSuccess = onSuccess || function () {};
  onError   = onError   || function () {};

  var onConnect = function (err, client, done) {
    client.query(query, values, function (err, res) {
      done();
      if (err) {
        onError(err);
      } else {
        onSuccess(res.rows);
      }
    }); 
  }

  Driver.connect(onConnect, onError);

  return this;
}

module.exports = Driver;
