var Model = require('./model')

var ParcelRule = Model.extend({

  attributes: {
    'id': undefined,
    'parcel_id': undefined
  }

}, {

  table: 'parcel_rules'

})

module.exports = ParcelRule
