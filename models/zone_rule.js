var Model = require('./model');

var ZoneRule = Model.extend({

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
