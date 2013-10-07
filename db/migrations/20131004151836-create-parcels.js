var dbm = require('db-migrate');
var type = dbm.dataType;
var tableName = 'parcels';

exports.up = function(db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    code: 'string',
    title: 'string',
    description: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable(tableName, callback);
};
