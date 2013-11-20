var config = require( process.cwd() + '/config/config' );
var utils  = require( process.cwd() + '/lib/utils' );
var pg     = require('pg');
var Driver = function () {};

var constructWhere = function (obj, str) {
  var tmp = [];
  var join;

  str = str || '';

  if (Array.isArray(obj)) {
    join = 'OR';
    for (var i = 0; i < obj.length; i++) {
      tmp.push( constructWhere(obj[i]) );
    }
  } else {
    join = 'AND';
    for (key in obj) {
      tmp.push('("' + key + '" = \''+ obj[key] + '\')');
    }
  }

  str += '(' + tmp.join(' ' + join + ' ') + ')';

  return str;
}

//
// Creates a connection to the DB
//
Driver.connect = function (onSuccess, onError) {

  pg.connect(config.database, function (err, client) {
    if (err) {
      onError(err);
    } else {
      onSuccess(client);
    }
  });

}

//
// Queries the DB
//
Driver.query = function (query, values, onSuccess, onError) {

  onSuccess = onSuccess || utils.noop;
  onError   = onError   || utils.noop;

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
}

//
// Finds all rows from a table;
//
Driver.all = function (table, onSuccess, onError) {
  var query = 'SELECT * FROM ' + table + ';'
  Driver.query(query, null, onSuccess, onError);
}

//
// Selects the first row from a table;
//
Driver.first = function (table, onSuccess, onError) {
  var query = 'SELECT * FROM ' + table + ' LIMIT 1;'
  Driver.query(query, null, onSuccess, onError);
}

//
// Selects the last row from a table;
//
Driver.last = function (table, onSuccess, onError) {
  var query = 'SELECT * FROM ' + table + ' LIMIT 1 ORDER DESC;'
  Driver.query(query, null, onSuccess, onError);
}

//
// Finds a row within the DB
//
Driver.where = function (table, conditions, onSuccess, onError) {
  conditions = constructWhere(conditions);

  var query = '';
  query += 'SELECT * FROM ' + table + ' ';
  query += 'WHERE ' + conditions + ';';

  Driver.query(query, null, onSuccess, onError);
}

//
// Inserts a row into the DB
//
Driver.create = function (table, data, onSuccess, onError) {
  var columns = utils.keys(data);
  var values  = utils.values(data);
  var indices = [];

  for (var i = 1; i <= columns.length; i++) {
    indices.push('$' + i);
  }

  indices = indices.join(', ');
  columns = columns.join(', ');

  var query = '';
  query += 'INSERT INTO ' + table + ' ';
  query += '( ' + columns + ' ) ';
  query += 'VALUES( ' + indices + ') ';
  query += 'RETURNING *';

  Driver.query(query, values, onSuccess, onError);
}

//
// Updates a row in the DB.
//
Driver.update = function (table, conditions, data, onSuccess, onError) {
  var columns = utils.keys(data);
  var values  = utils.values(data);
  var set     = [];

  conditions = constructWhere(conditions);

  for (var i = 0; i < columns.length; i++) {
    set.push(columns[i] + ' = ' + '$' + (i + 1));
  }

  set = set.join(', ')

  var query = '';
  query += 'UPDATE ' + table + ' ';
  query += 'SET ' + set + ' ';
  query += 'WHERE ' + conditions + ' ';
  query += 'RETURNING *;';

  Driver.query(query, values, onSuccess, onError);
}

Driver.destroy = function (table, conditions, onSuccess, onError) {
  conditions = constructWhere(conditions);

  var query = '';
  query += 'DELETE FROM ' + table + ' ';
  query += 'WHERE ' + conditions + ';';

  Driver.query(query, null, onSuccess, onError);
}

module.exports = Driver;
