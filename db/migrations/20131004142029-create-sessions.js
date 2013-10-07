var dbm = require('db-migrate');
var type = dbm.dataType;
var tableName = 'sessions';

exports.up = function(db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    category_id: 'int',
    parcel_id: 'int',
  }, function (a) {
    db.runSql("ALTER table " + tableName + " ADD COLUMN use_modifier_ids integer[]", callback);
  });
};

exports.down = function(db, callback) {
  db.dropTable(tableName, callback);
};
