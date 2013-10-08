var dbm = require('db-migrate');
var type = dbm.dataType;
var tableName = 'category_zones';

exports.up = function(db, callback) {
  db.createTable(tableName, {
    category_id: 'int',
    zone_id: 'int',
    score: 'int'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable(tableName, callback);
};
