var pg = require('pg')
var codes = require('./data/naics-2012.json')
var utils = require('./lib/utils')

config = {
  host:     'localhost',
  database: 'dof'
}

var perform = module.exports.perform = function () {
  pg.connect(config, function (err, client) {

    var items = codes.items;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.title !== undefined && item.code !== undefined) {
        client.query(
          'INSERT INTO naics_categories (code, title) VALUES($1, $2) RETURNING code', [item.code, item.title], function (err, result) {
            if (err) {                                                                                                                                                                             
              console.log(err) 
            } else {
              console.log('Row inserted with id: ' + result.rows[0].code) 
            }
          }
          );
      }
    };

  }); 
}
