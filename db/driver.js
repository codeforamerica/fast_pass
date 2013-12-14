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

  pg.connect(config.database, function (err, client) {
    if (err) {
      onError(err);
    } else {
      onConnect(client);
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

  var onConnect = function (client) {
    client.query(query, values, function (err, res) {
      if (err) {
        onError(err);
      } else {
        onSuccess(res.rows);
      }
      client.end();
    }); 
  }

  Driver.connect(onConnect, onError);

  return this;
}

module.exports = Driver;
