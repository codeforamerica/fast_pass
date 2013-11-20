var dbm  = require('db-migrate');
var type = dbm.dataType;
var name = 'sessions';

exports.up = function(db, callback) {
  db.runSql('CREATE TABLE ' + name + ' ( id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), data json );', callback);
};

exports.down = function(db, callback) {
  db.dropTable(name, callback);
};
