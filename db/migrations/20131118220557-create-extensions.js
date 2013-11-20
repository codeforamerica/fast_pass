var dbm  = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.runSql('CREATE EXTENSION "uuid-ossp";', callback);
};

exports.down = function(db, callback) {
  db.runSql('DROP EXTENSION "uuid-ossp";', callback);
};
