var dbm  = require('db-migrate');
var type = dbm.dataType;
var name = 'parcels';

exports.up = function(db, callback) {
  db.runSql('CREATE TABLE ' + name + ' ( id varchar PRIMARY KEY, data json, geom geometry(MultiPolygonZ,4326) );', callback);
};

exports.down = function(db, callback) {
  db.dropTable(name, callback);
};
