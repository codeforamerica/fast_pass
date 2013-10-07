var dbConfig = require(process.cwd() + '/config/database')[process.env.NODE_ENV];
var database = {}

var dbConfigKeys = Object.keys(dbConfig);

for (var i = 0; i < dbConfigKeys.length; i++) {
  var key = dbConfigKeys[i];
  var val = dbConfig[key];

  if (typeof(val) === 'object' && typeof(val.ENV) !== 'undefined') {
    database[key] = process.env[val.ENV];
  } else {
    database[key] = val;
  }
}

var Config = {
  database: database
}

module.exports = Config;
