var dbm  = require('db-migrate');
var type = dbm.dataType;

var extensions = [ 'uuid-ossp', 'postgis' ];

exports.up = function(db, callback) {
  var query = '';
  for (var i = 0; i < extensions.length; i++) {
    query += 'CREATE EXTENSION "' + extensions[i] + '";';
  }
  db.runSql(query, callback);
};

exports.down = function(db, callback) {
  var query = '';
  for (var i = 0; i < extensions.length; i++) {
    query += 'DROP EXTENSION "' + extensions[i] + '";';
  }
  db.runSql(query, callback);
};
