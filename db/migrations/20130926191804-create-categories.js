var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('categories', {
    id: { type: 'int', primaryKey: true },
    title: 'string',
    description: 'string',
    code: 'string',
    type: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('categories', callback);
};
