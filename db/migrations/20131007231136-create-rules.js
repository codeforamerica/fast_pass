var dbm = require('db-migrate');
var type = dbm.dataType;
var tableName = 'rules';

exports.up = function(db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    attribute: 'string',
    operator: 'string',
    value: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable(tableName, callback);
};
