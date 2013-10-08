var dbm = require('db-migrate');
var type = dbm.dataType;
var tableName = 'parcels';

exports.up = function(db, callback) {
  db.createTable(tableName, {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    code: 'string',
    title: 'string',
    description: 'string'
  }, function () {
    db.runSql("ALTER table " + tableName + " ADD COLUMN zone_ids integer[]", callback);
  })
};

exports.down = function(db, callback) {
  db.dropTable(tableName, callback);
};
