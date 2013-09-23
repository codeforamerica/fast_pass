var DBModel = require('./db_model')

var ParcelRule = DBModel.extend({

  defaults: {
    'id': undefined,
    'parcel_id': undefined
  }

}, {

  table: 'parcel_rules'

})

module.exports = ParcelRule
