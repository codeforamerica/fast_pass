var dbm = require('db-migrate');
var type = dbm.dataType;
var tableName = 'rule_sets';

exports.up = function(db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    score: 'int',
    type: 'string'
  }, function () {
    db.runSql("ALTER table " + tableName + " ADD COLUMN rule_ids integer[]", callback);
  });
};

exports.down = function(db, callback) {
  db.dropTable(tableName, callback);
};
