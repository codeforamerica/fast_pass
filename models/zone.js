var DBModel = require('./db_model')

var Zone = DBModel.extend({

  defaults: {
    'title': undefined,
    'description': undefined,
    'code': undefined
  }

}, {

  'table': 'zones'

});

module.exports = Zone
