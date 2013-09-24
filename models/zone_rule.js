var DBModel = require('./db_model');

var ZoneRule = DBModel.extend({

  attributes: {
    'id': undefined,
    'category_ids': undefined,
    'zone_id': undefined,
    'operator': undefined
  }

}, {

  table: 'zone_rules'

})

module.exports = ZoneRule
