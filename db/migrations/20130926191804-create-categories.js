var dbm = require('db-migrate');
var type = dbm.dataType;
var tableName = 'categories';

exports.up = function(db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    title: 'string',
    description: 'string',
    code: 'string',
    type: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable(tableName, callback);
};
